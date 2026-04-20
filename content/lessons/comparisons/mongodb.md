---
title: 'MongoDB vs. DynamoDB'
description: "Comparison of DynamoDB and MongoDB, two of the most popular NoSQL databases"
lesson: 1
chapter: 8
date: "2/27/2020"
type: "lesson"
---

MongoDB is an open-source document database first released in 2009. It was enormously influential in kicking off the NoSQL revolution due to its strong focus on developer experience and ease of use.

In this article, we will compare MongoDB with DynamoDB. In doing so, we will compare these two databases in four main areas:

* Popularity and availability
* Data modeling
* Operations model
* Connection & security model

Let's get started!

## Popularity and availability

To begin, let's take a look at the relative popularity of the two databases.

As of February 2020, MongoDB is the fifth most-popular database and DynamoDB is the sixteenth most-popular database:

<img width="1051" alt="DB Engines Ranking February 2020" src="https://user-images.githubusercontent.com/6509926/75441124-b0e85e00-5922-11ea-8948-a0f1533653a8.png">

MongoDB's lead is due to a few reasons. First, MongoDB was released three years earlier than DynamoDB. This allowed MongoDB to build a healthy user base, particularly as it focused on developer experience and happiness. MongoDB was used by a lot of application developers that didn't necessarily need the scale of NoSQL but did enjoy the ergonomics of working with a schemaless, document-oriented database.

If we look at the popularity trendline over time, you can see that MongoDB started with a huge lead back in 2013 when DB-Engines started tracking. Over time, DynamoDB has been closing that gap.

<img width="1033" alt="Screen Shot 2020-02-27 at 5 59 15 AM" src="https://user-images.githubusercontent.com/6509926/75443084-4f29f300-5926-11ea-97b9-ae6e84ced5bc.png">

A second reason is that MongoDB is open-source and freely available, where DynamoDB is a proprietary database from Amazon Web Services (AWS). This necessarily limits DynamoDB to developers that are using AWS, while MongoDB can be run on other cloud providers or even on-prem. While this availability does increase the places where you can use MongoDB, I argue in operations section below that the proprietary nature of DynamoDB is an asset.

## Data modeling

Let's move on to the data modeling aspect of these two databases. How does MongoDB's data model compare to DynamoDB's data model?

At a quick glance, you might say MongoDB is a document database while DynamoDB is a wide-column store. While true, those descriptions are opaque and obscure the underlying similarities between the two databases. To accurately answer this question, you really need to split this into two categories: high-scale and low-scale.

### Data modeling at high scale

[NoSQL databases were designed to handle high-scale applications that relational databases could not handle](https://www.alexdebrie.com/posts/dynamodb-no-bad-queries/). To do this, NoSQL databases removed some features from relational databases that were sources of slowness, like joins and aggregations. They also use notions of partitions to help shard data across multiple storage nodes, allowing for consistently fast response times as your data scales.

If you are working with high scale, your data modeling is going to be very similar between DynamoDB and MongoDB. You'll need to take advantage of [single-table design](https://www.alexdebrie.com/posts/dynamodb-single-table/) to "pre-join" your data by colocating related items near each other. And you'll need to handle aggregations yourself by maintaining counters rather than relying on read-time aggregations.

At this scale, the differences between document databases and wide-column stores fade away. It's in the lower-scale use cases that the differences between MongoDB and DynamoDB are more apparent.

### Data modeling at lower scale

Not every application has the scalability concerns of Amazon.com or Lyft. Most applications have significantly lower data volume and velocity. So how do the data models of DynamoDB and MongoDB compare at lower scale?

At lower scale, there is a clear difference in philosophy between DynamoDB and MongoDB.

DynamoDB's philosophy is that it [won't let you write a bad query](https://www.alexdebrie.com/posts/dynamodb-no-bad-queries/). And by 'bad query', that means a query that won't scale. Even if your data is less than 10 GB, you won't be able to do things like joins or aggregations with DynamoDB. This results in a rigid data model. On the plus side, you know exactly what you're getting with DynamoDB. Your performance won't degrade over time, even if your application scales to 1000x the original size.

MongoDB has a different philosophy. It is designed for developer productivity and easier on-boarding. This has a few implications. First, it's easier to make the transition from a relational database to MongoDB. MongoDB has significantly [more flexible indexing capabilities](https://docs.mongodb.com/manual/indexes/#index-types), [limited join capabilities](https://docs.mongodb.com/manual/core/data-model-design/#normalized-data-models), and an [aggregation framework](https://docs.mongodb.com/manual/aggregation/) that allows for read-time aggregations. For those on the on-ramp to NoSQL, this can make it easier.

However, this flexibility comes with a cost. Joins and aggregations have performance characteristics that are difficult to know up front and can degrade significantly as your data changes. The time you saved up front may bite you down the road as you're performing a significant refactor to rip out joins and aggregations.

## Operations model

With the data modeling section out of the way, let's move on to the operations model. After all, there's more to a database than simply using it in your application. You also need to make sure you can run it in a fast, safe, and reliable way.

The operations models for MongoDB and DynamoDB are quite different and are directly related to the availability model discussed above. MongoDB is freely-available software that you can run yourself while DynamoDB is only available as a service from AWS. This has big implications on operations.

Operationally, MongoDB uses a more traditional model for databases. You will install the MongoDB software onto one or more compute instances (whether bare metal, virtual machines, or containers). Each of these instances will have some amount of compute, memory, and storage associated with it that will be used by MongoDB.

DynamoDB has a more radical model. Rather than thinking about instances, you only think about usage. You are not responsible for installing software, managing servers, or increasing your cluster size. You only tell AWS how much read and write capacity you want (or skip it altogether by using On-Demand Pricing). As your data usage needs grow, you simply increase the capacity you need.

AWS will completely handle the instances in their DynamoDB fleet, so you don't need to think about instance failure or degradation. You don't need to worry about backups. You don't need to worry about increasing your cluster size.

There are more 'managed' MongoDB offerings in recent years, such as MongoDB Atlas or AWS DocumentDB (with MongoDB compatibility). These offerings help with the low-level aspects of running a database, but you are still bound to instance-based thinking. Scaling down is near impossible. Scaling up requires increase the size or number of instances and the associated migration. [Rick Houlihan](https://twitter.com/houlihan_rick) has shared stories of MongoDB customers that need to wait _nine months_ to add shards due to all the rebalancing of data that occurs.

As someone who has managed database instances before, the service-based, pay-per-use model of DynamoDB is a huge advancement over the instance-based model of prior databases.

## Connection & security model

The last area I want to discuss is the connection and security model. This section is most relevant if you're using serverless compute like [AWS Lambda](https://docs.mongodb.com/manual/aggregation/), but it can affect other concerns as well.

MongoDB is like most traditional, server-based databases. You have a known number of instances of your database. To protect your database from the outside world, you usually place your MongoDB instance in a private area of your network. Your application servers have network access to your MongoDB databases but the public internet does not. Your application servers will spin up a persistent connection over TCP to interact with MongoDB.

In contrast, DynamoDB is a service-based database hosted by AWS. With DynamoDB, all access is done using the DynamoDB API over HTTPS. Rather than relying on network partitioning to protect your database, DynamoDB relies on [AWS IAM](https://aws.amazon.com/iam/) permissions to authenticate and authorize clients.

If you're using traditional compute like virtual machines or containers, this doesn't make much of a difference either way. However, if you're using hyper-ephemeral compute like AWS Lambda, this can make a huge difference.

With traditional compute, your compute instances are fairly long-lived. This could be days or months, with VMs, or it could be hours with containers. The main point is that your compute sticks around to handle multiple requests over a period of time. 

With compute like AWS Lambda, you have tiny compute instances spinning up and going away constantly. For these ephemeral compute instances, it's harder to work with a traditional server-based database. You need to make sure your compute has the relevant network access to access MongoDB. This adds latency to your compute initialization and complexity to your infrastructure.

This connection and security model is a major reason why AWS Lambda users have been reaching for DynamoDB over traditional databases.

## Conclusion

In this post, we saw how DynamoDB compares to MongoDB. The major points are:

* MongoDB is more popular than DynamoDB, partly due to its head start and partly due to its wider availability.
* DynamoDB has a more hands-off operations model than MongoDB as you don't think to think about instances and scaling up or down.
* At high scale, DynamoDB and MongoDB have very similar data modeling principles.
* At lower scale, MongoDB has a more flexible data model.
* DynamoDB's connection and security model make it a popular choice for use with serverless compute like AWS Lambda.
