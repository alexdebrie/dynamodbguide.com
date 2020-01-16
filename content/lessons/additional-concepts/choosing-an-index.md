---
tocTitle: 'Choosing an index type'
title: "Local or global: Choosing a secondary index type in DynamoDB"
description: "Compare local secondary indexes and global secondary indexes in DynamoDB, and learn when you should choose one over the other."
lesson: 1
chapter: 7
date: "1/16/2020"
type: "lesson"
---

Secondary indexes are a critical part of modeling your data in DynamoDB. With a secondary index, you can add additional access patterns to your application without the hassle of maintaining multiple copies of the same data. DynamoDB will handle all replication from the base table to your secondary index.

There are two types of secondary indexes: local secondary indexes and global secondary indexes. They are pretty similar overall, but there are some slight differences in how they function.

In this lesson, we'll see how to choose between a local and global secondary index. We'll cover:

- The benefits of a local secondary index;
- The limitations of a local secondary index.
- The TL;DR flow chart version of choosing an index type

## The benefits of a local secondary index

I default to using global secondary index for all of my indexes and rarely consider using local secondary indexes. That said, there are two features of local secondary indexes that you can't get with global secondary indexes. These features are:

- Strongly-consistent reads
- Reuse of base table capacity

Let's review each of these.

### Strongly-consistent reads

When reading from your base table in DynamoDB, you can [choose between strongly consistent reads and eventually consistent reads](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html). A strongly consistent read will return the latest value for a given item, incorporating all successful write operations that have occurred. An eventually consistent read will likely include the latest value for a given item but may reflect slightly stale data. This is due to how DynamoDB (and NoSQL databases generally) replicate data across replicas.

By default, all reads will be eventually consistent. An eventually consistent read consumes half the read capacity units of a strongly consistent read. If you want a strongly consistent read, you'll need to include the `ConsistentRead` property in your API request.

With a local secondary index, you have the same options as with a base table. By default, all reads from a local secondary index are eventually consistent. However, you may opt into a strongly consistent read if you need it. With a global secondary index, you don't have this option. All reads from a global secondary index are eventually consistent.

If you have strong consistency requirements in your application, the local secondary index is a better choice for you.

### Reuse of base table capacity

A second benefit of local secondary indexes is that they reuse the provisioned throughput from your base table. In certain situations, this can be cheaper than global secondary indexes.

If you're using the [Provisioned pricing mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadWriteCapacityMode.html#HowItWorks.ProvisionedThroughput.Manual) for DynamoDB, you'll provision a certain number of read and write capacity units for your DynamoDB table. This specifies the maximum number of read and write operations per second that your table can handle.

If you're using a global secondary index, you will need to specify additinal read and write capacity units for that index separately from your main table. However, with a local secondary index, you will use the capacity from your base table.

In most situations, this won't save you much money. You'll need to figure the capacity needed for your main table and the capacity needed for your local secondary index. Add them together, and this is the number you'll need for your base table's provisioned throughput.

However, these shared capacity units could be helpful if you have an uneven workload across time such that sharing units could reduce the overall capacity units you need. This could come up in two scenarios.

First, if your read patterns on your base table and secondary index are temporally different. Perhaps your base table is read a lot in the morning and afternoon, while your local secondary index is read a lot overnight when runnning reports. In this case, you wouldn't need to provision capacity units on two separate entities that both account for their respective high water marks. Rather, you could share across them.

The second example is if you had multiple sparse local secondary indexes on your table. Generally, a write to your table with a local secondary index will cost 2X what it would cost for just the base table, as any write will be replicated to the index as well. However, if you had three sparse indexes on your table, and any write to your base table was only replicated to a single local secondary index, you could get efficiencies by sharing the capacity units across the multiple indexes.

In reality, both of these situations aren't that common. It's unlikely you'll be able to save a meaningful amount of money by choosing a local secondary index over a global secondary index.

## Downsides of local secondary indexes

Now that we've seen the potential upsides of a local secondary index, let's take a look at the downsides. There are three main downsides to local secondary indexes:

- Must use the same partition key as the base table
- Must be created when the table is created
- Adds a 10GB limit to any single item collection

Let's review each of these in turn.

### Must use the same partition key as the base table

The most common reason that a local secondary index won't work for your application is because a local secondary index must use the same partition key as your base table. For many application patterns, this is not feasible.

That said, this can be a useful pattern for some folks. If you have a dataset where you're usually searching within a particular partition but have different sorting patterns within the partion, it can be a nice fit.

One example is a table containing actors and actresses and the various movies in which they've appeared. You might have an access pattern where you want to fetch all movies for a particular actor in a way where you can filter based on the name of the movie. Your base table would look as follows:

<img width="685" alt="Base table with Actors and Movies" src="https://user-images.githubusercontent.com/6509926/72524174-f2b3be00-3826-11ea-9db5-a13d03c1a07b.png">

In this table, the actor's name is the partition key and the movie name is the sort key.

Then, you might have a second access pattern that wants to find all movies for an actor within a given time range. You could set up a local secondary index where the partition key is Actor and the sort key is Year.

<img width="681" alt="LSI with Actor and Year" src="https://user-images.githubusercontent.com/6509926/72524173-f2b3be00-3826-11ea-8f4a-1300e2b15777.png">

Note that this is the same data, it has just been rearranged due to a secondary indexes. In this example, the partition key is the same for our base table and index -- the actor's name.

If you had a third access pattern where you wanted to find all the actors in a particular movie, a local secondary index wouldn't work. In this secondary index, you'd need to make Movie your partition key and Actor your sort key.

<img width="684" alt="GSI with Movies and Actors" src="https://user-images.githubusercontent.com/6509926/72524172-f2b3be00-3826-11ea-83f5-eefbc4f1cc45.png">

Because the partition key is different than your base table, you couldn't use a local secondary index.

### Local secondary indexes must be created when the table is created

A second reason that local secondary indexes aren't used is because of the timing -- they must be created when the table is created. If your table already exists and you want to add an additional secondary index to enable more access patterns, you must use a global secondary index.

In general, this shouldn't be a huge deal. When using DynamoDB, you should plan for all of your access patterns up front, before you design and create your table. It is at this point that you can plan for a local secondary index.

That said, applications evolve and access patterns change. You may find yourself adding secondary indexes after your table has been live for a while. In those cases, a global secondary index is your only option.

### Local secondary indexes add an item collection size limit

The final downside to local secondary indexes is more obscure but can really bite you in the wrong situation. If you add a local secondary index, there is a 10GB limit to any given item collection.

What is an item collection? I'm glad you asked! An item collection is all of the items with the same partition key in your base table and local secondary indexes. For example, in our Movies example from earlier, we would have three item collections: Tom Hanks, Tim Allen, and Natalie Portman.

<img width="683" alt="Item collections with Actors & Movies" src="https://user-images.githubusercontent.com/6509926/72524797-4d014e80-3828-11ea-92ea-0195e8a01c0c.png">

In a single actor's partition, you would need to add up the total size of the items to get the size of the item collection. When you're using a local secondary index, the item collection includes the size of all items with that partition key in the local secondary index as well. If you're projecting the full item into your index, this would double the size of your item collection.

This won't be a problem for most applications if you have a partition key with high cardinality to distribute values across your key space. But what if you had an actor that's been in a lot of movies?

<img width="754" alt="Actors & Movies with Samuel L. Jackson" src="https://user-images.githubusercontent.com/6509926/72524798-4d014e80-3828-11ea-8881-140eedf11ee0.png">

Samuel L. Jackson has been in _a lot_ of movies. Now you might hit the item collection limit. This would block reads on your base table if you would exceed the 10GB limit, which would be a frightening surprise.

Note that the 10GB item collection size limit does not apply at all if you don't have a local secondary index on your table. If you're using local secondary indexes and are worried about hitting the size limit, the DynamoDB docs have good advice on [monitoring the size of your item collections](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/LSI.html#LSI.ItemCollections.SizeLimit) to alert you before it's too late.

## The 'Too long; Didn't Read' version of choosing an index

In the sections above, we walked through the pros and cons of local secondary indexes. A global secondary index is a more vanilla version of the local secondary index. It doesn't have the upsides like strong consistency or shared capacity, but it also doesn't have the downsides of item collection size limits or the same partition key requirement.

For those of you that want a quick answer to choosing an index, this section has the quick version. The basic flow is as follows:

![Secondary Index flow chart](https://user-images.githubusercontent.com/6509926/72526710-a66b7c80-382c-11ea-8923-dbb9c9589881.png)

Starting at the top left, work your way down the left side to see if there's any reason you *should* consider a local secondary index. If neither of the two main reasons help you, then choose a global secondary index.

If you think you do have a reason for using a local secondary index, then move to the right side to see if there will be any reasons you *can't* use a local secondary index.

- Does my secondary index have a different partition key from my base table?
- Does my table already exist?
- Will one of my item collections exceed 10GB?

If the answer to all of these questions is "No", then I could use a local secondary index. If any of them are "Yes", then I need to rethink my needs, recreate my table, or just use a global secondary index.