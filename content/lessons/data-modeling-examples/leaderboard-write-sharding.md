---
title: "Leaderboard & Write Sharding"
description: "Walkthrough example of maintaining a global leaderboard with DynamoDB. The example uses write sharding and a scatter-gather pattern to alleviate throttling issues."
lesson: 3
chapter: 6
date: "12/26/2018"
type: "lesson"
---

In this example, we'll show how to maintain a _global leaderboard_ with a dataset in DynamoDB. A leaderboard is a common need for data applications. Imagine that you're saving information on individual items that you need for individual lookups, but you also want to be able to find the Top N Items as ranked by a particular attribute.

The guiding example for this is a website that hosts a number of images -- think [Unsplash](https://unsplash.com/). In addition to retrieving the details on any given image, we also want to find the top-viewed items to show to users.

In this walkthrough you will understand how to use **write sharding** combined with a **scatter-gather query** to satisfy the leaderboard use case.

Hat tip to [Chris Shenton](https://twitter.com/Shentonfreude) for initially discussing this use case with me. Also, AWS provides a [leaderboard example using game scores](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html) in the DynamoDB docs. However, that example uses leaderboards within multiple different games, rather than a global leaderboard as we have here.

## Example background

In this example, we're a photo sharing website. People can upload photos to our site, and other users can view those photos. Additionally, we want to have a discovery mechanism where we show the 'top' photos based on number of views.

Based on this, we have four main access patterns:

- Add a new image (CREATE);
- Retrieve a single image by its URL path (READ);
- Increase the view count on an image (UPDATE);
- Retrieve the top N images based on total view count (LEADERBOARD).

The first three access patterns are straight-forward. These are key-based operations, which are perfect fits for DynamoDB.

The fourth access pattern is the tricky one. Recall that DynamoDB is designed for specific, key-based operations. But finding the top score means we need knowledge of the _entire_ DynamoDB key space. This sounds like it requires a [scan](./scans), which we know we should never do.

Fortunately, we have a better answer. We're going to use a combination of [global secondary indexes](./global-secondary-indexes), write sharding, and scatter-gather queries to implement this without running a full table scan.

Let's get started!

## Schema Design: Primary Key and core attributes

Now, let's start with the nitty-gritty of designing and using our table. We will start with the three core use cases.

Recall that our three core use cases (create, read, and update an image) are all key-based lookups for a particular image. Each image will have a URL path in the form of `images/<id>.jpg`. This path is a unique identifier for the image, so we'll use it for the table's primary key. 

We'll also include some data about the image, such as its storage location(s), its owner, its dimensions, etc. These can be in a _data_ property on each image item.

Further, we want to track the view count for each image. This can be in an integer property called _ViewCount_. Whenever someone views an image, we will update the ViewCount with a [UpdateItem](updating-deleting-items#updating-items) API call.

At this point, our schema looks like this:

```
<u>Name</u>			<u>Type</u>		<u>Primary Key</u>
Image			String 		HASH
Data			Map			--
ViewCount		Integer		--
```

## Adding a Leaderboard -- No Write-Sharding

Now we need to update our schema to allow for our leaderboard use case. We will use a combination of a Global Secondary Index and a write-sharding pattern to do this. Let's discuss why.

To find the top N images, we need to be able to **order by ViewCount**. Whenever you need to order by in DynamoDB, you have that attribute as a sort (RANGE) key within the given partition (HASH) key that you want to sort.

Thus, it sounds like we want to create a [Global Secondary Index](./global-secondary-indexes), or "GSI". A GSI needs both a partition key and a sort key. The sort key is ViewCount as that's the attribute we want to order. 

Since we want to see top views across all images on the site, we need the same partition key for all images. Let's add an attribute that will be the same for all images in our system. For each image we add to the system, we will have an attribute called "GSI Hash" with a value of "IMAGES".

Our updated schema looks as follows:

```
<u>Name</u>			<u>Type</u>		<u>Primary Key</u>		<u>Leaderboard GSI</u>
Image			String 		HASH
Data			Map			--
ViewCount		Integer		--				RANGE
GSI Hash		String		--				HASH
```

Let's look through some diagrams of our sample data in our table.

First, the image below shows how our table is structured in its main format with the primary key. Each item has the "Image" property to uniquely identify it. It also has a "ViewCount" property for the number of views, and a "GSI Hash" with a value of "IMAGES" for each item.

![lb_initial](https://user-images.githubusercontent.com/6509926/50383368-e2f39580-0677-11e9-9b51-70ac2a18363e.png)

The next image shows how the Leaderboard GSI will restructure our data into a different format. On the left is our table in its main format. On the right is our table in the Leaderboard GSI. Note how the items have the same data, they're just organized in a different fashion.

![lb_initial_move](https://user-images.githubusercontent.com/6509926/50383369-e2f39580-0677-11e9-8dc0-27abd0e0b3b1.png)

Finally, this last image shows why we want to use the Leaderboard GSI. See how the images have been sorted by ViewCount within the IMAGES partition. We can query this index to find the top images by ViewCount.

![lb_initial_ordering](https://user-images.githubusercontent.com/6509926/50383370-e2f39580-0677-11e9-9d29-43667a1a8d4a.png)

## Hot Partitions and Write-Sharding

While the format above could work for a simple table with low write traffic, we would run into an issue at higher load. Let's understand why, and then understand how to handle it.

DynamoDB splits its data across multiple nodes using [consistent hashing](./the-dynamo-paper#infinitely-scalable). As part of this, each item is assigned to a node based on its partition key. You want to structure your data so that access is relatively even across partition keys. This ensures that you are making use of DynamoDB's multiple nodes.

That's the problem with our current Leaderboard GSI -- all of our items use the same partition key ("IMAGES"). This means all data will be routed to the same node. If we're doing a large amount of writes, our writes to the Leaderboard GSI could get throttled since all operations are pounding the same node.

To handle this, we will use a strategy called **write-sharding**.

Rather than putting all images in the same Leaderboard GSI partition, we will arbitrarily split them across N number of partitions. The images within each partition will be sorted by view count.

For example, imagine we want to split our Leaderboard GSI into three partitions. Upon creating an item, we will add an attribute called "Partition" and randomly assign the item to one of our three partitions -- "PARTITION\_0", "PARTITION\_1", or "PARTITION\_2".

Our schema now looks as follows:

```
<u>Name</u>			<u>Type</u>		<u>Primary Key</u>		<u>Leaderboard GSI</u>
Image			String 		HASH
Data			Map			--
ViewCount		Integer		--				RANGE
Partition		String		--				HASH
```

Our initial table would look as shown in the image below. Each item has an Image attribute, a ViewCount attribute, and a Partition attribute.

![leaderboard_primary](https://user-images.githubusercontent.com/6509926/50383548-c5c0c600-067b-11e9-83ef-d9475166ad41.png)

Like in the previous example, the Leaderboard GSI would reorganize our data into a different structure, as shown below.

![leaderboard_reindex](https://user-images.githubusercontent.com/6509926/50383547-c5c0c600-067b-11e9-89c9-ed9108c28001.png)

The difference from the original example is that our images are only sorted _within a particular partition_. As shown below, all images in PARTITION\_1 are ordered by ViewCount. PARTITION\_0 and PARTITION\_2 are also ordered by ViewCount, but separately from PARTITION\_1.

![leaderboard_viewcount](https://user-images.githubusercontent.com/6509926/50383546-c5c0c600-067b-11e9-927d-4a1127b4db28.png)

We have solved our hot partition problem. However, now we have a different problem -- images are only sorted within a particular partition. How do we find the overall top images?

In the next section, we will show how to use a scatter-gather pattern to build our overall leaderboard.

## Building a leaderboard with Scatter-Gather

In the previous section, we sharded our leaderboard GSI across multiple partitions to alleviate hot partition issues. In this section, we will show how to work with these partitions to build an overall leaderboard.

In our example, we used three partitions to shard our data. Imagine that we want to find the top 3 images by view count across our entire data set.

To do this, we need to do the following steps.

1. Query _each of our partitions_ to find the top 3 images by view count within each partition. 

	The image below demonstrates this:

	![leaderboard_sg_assemble](https://user-images.githubusercontent.com/6509926/50383710-053ce180-067f-11e9-8a92-8c4ba3b3ea5d.png)
	
	On the left is our table as organized by the Leaderboard GSI index. In our application code, we will query each of the three partitions for the top three images. On the right are our results of the three queries in our application code.
	
	This is the "scatter-gather" portion. We are making multiple, separate queries to our database ("scatter") and then combining the results ("gather") in our application code.
	
2. In our application code, sort the results by view count to obtain a consolidated view.

	The image below shows our data after it is gathered but before sorting (left), then after sorting (right).

	![leaderboard_sg_sort](https://user-images.githubusercontent.com/6509926/50383709-053ce180-067f-11e9-8db2-aeeed3108573.png)
	
3. Return the top 3 results to our users.

	Now that you have a global sorting of your data, you can return the proper results to your user.
	
That's it! Write sharding combined with scatter-gather can be a powerful tool to use with DynamoDB.

## Write Sharding Considerations

Now that we understand the pattern of write sharding, let's close with a few things you should consider when using the write-sharding pattern.

1. **To write shard or not to write shard?** 

	The first question is whether you truly need write sharding at all. Write sharding adds complication to your application, both at write time (randomizing your partition attribute) and at read time (implementing scatter-gather).
	
	You should only use write sharding if your write traffic is too high for the GSI to handle writing to a single partition.

2. **How many partitions to shard across?**

	A second question is how many partitions to shard across. In our simple example, we used three partitions. However, you could easily imagine high write traffic patterns that need significantly more write partitions to avoid throttling.
	
	The important thing to understand is that partitions are a tradeoff. Adding more write partitions will decrease throttling pressure. However, it will add read complexity as you will need to "scatter" across more partitions to build your final data set.
	
3. **How many items do I need to read from each partition to build a leaderboard?**

	A final question is how many items you need to read from each partition to build a proper leaderboard. This is a pretty interesting question, and it depends on your application needs.
	
	In our example, we had a small number of partitions and only wanted the top three images. We queried for the top three images across each partition. *By querying each partition for the number of end results we wanted, we ensured we would get the proper result.*
	
	You could imagine this being more expensive. What if we needed the top 1000 items, and we had 10 partitions? Do we really need to retrieve 10,000 items? After all, it seems pretty unlikely that the 1000th item in partition 1 would be higher than the top item in all of the other partitions.
	
	I'm sure there's some math on how few items you could retrieve from each randomly-assigned partition to have some confidence that you have the right answer. Ultimately, this is a game of probabilities -- there is the chance, however tiny, that the top 1000 items will all be in the same partition.
	
	The question of whether you can take that chance and how big of a chance you can take depends on your application. Do you need exact precision? If not, how imprecise can you be?
	
	
## Conclusion

In this walkthrough, we learned how to implement a global leaderboard in DynamoDB. We discussed how to use a write-sharding pattern with scatter-gather queries to alleviate throttling pressure on write-heavy applications.

> Is anything in this example unclear? [Hit me up](mailto:alexdebrie1@gmail.com) and let me know!

