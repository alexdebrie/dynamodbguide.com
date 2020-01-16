---
title: "The Dynamo Paper"
description: "Summary of the Amazon Dynamo Paper and the key design aspects behind DynamoDB."
lesson: 3
chapter: 1
date: "01/01/2018"
type: "lesson"
---

In 2004, Amazon.com was growing rapidly and was starting to hit the upper scaling limits of its Oracle database. It started to consider building its own database in-house (_note to readers: this is almost always a bad idea_).  Out of this experiment, the engineers created the Amazon Dynamo database which backed major internal infrastructure including the shopping cart on the Amazon.com website. 

A group of engineers behind the Amazon Dynamo database published the [Dynamo Paper](http://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) in 2007. It described the learnings from building an in-house, highly available key-value store designed to meet the demanding requirements of the Amazon.com website.

The paper was highly influential and inspired a number of NoSQL databases, including Apache Cassandra (originally developed at Facebook) and AWS offerings SimpleDB and DynamoDB. In 2012, Amazon Web Services launched DynamoDB, which was a managed database service modeled after the principles behind Dynamo.

> Want to know more about how DynamoDB scales? Check out this post on [SQL, NoSQL, and Scale: How DynamoDB scales where relational databases don't](https://www.alexdebrie.com/posts/dynamodb-no-bad-queries/).

## Key aspects of Dynamo

#### No Relational model

The relational data model is a useful way to model many types of data. Often, relational data is [normalized](https://en.wikipedia.org/wiki/Database_normalization) to improve the integrity of the data. Rather than duplicating a particular piece of data in multiple rows, you can store it in one place and refer to it using a JOIN operation from one table to another. Now you can update that single place, and all items that refer to that data will gain the benefits of the update as well.

Yet one of the most interesting findings of the Amazon.com engineers while gathering their database requirements was how their engineers were using their relational databases:

> About 70 percent of operations were of the key-value kind, where only a primary key was used and a single row would be returned. About 20 percent would return a set of rows, but still operate on only a single table.
> 
> \- Werner Vogels, [_A Decade of Dynamo_](http://www.allthingsdistributed.com/2017/10/a-decade-of-dynamo.html)

This is a huge deal -- *90% of operations weren't using the JOIN functionality that is core to a relational database!* 

The JOIN operation is expensive. At a large enough scale, engineers often denormalize their data to avoid making expensive joins and slowing down response times. This decrease in response time comes with a trade-off of increased application complexity -- now you need to manage more of your data integrity issues in your code rather than your database.

Amazon.com engineers were already making that trade-off of denormalization to improve response times. The realization that the relational model wasn't needed by Amazon engineers allowed the Dynamo designers to re-evaluate other aspects of a relational database.

#### Availability > Consistency

Most relational databases use a _strongly consistent_ model for their data. Briefly, this means all clients of the server will see the same data if querying at the same time. 

Let's use Twitter as an example. Imagine that Bob in Virginia tweets a cat picture at 2:30 PM. There are two users that view Bob's profile after he tweets his picture: his neighbor, Cheryl, and his uncle, Jeffrey, who lives in Singapore. If Twitter were using a strongly-consistent model, both Cheryl and Jeffrey should see Bob's most recent tweet as soon as it's committed to the database from Bob's action.

This might not be ideal, for a few reasons. First, think of the geography involved in this scenario. Twitter could choose to have a single database instance to enable this strong consistency. This database instance may be located in Virginia, close to Bob and Cheryl. This results in fast responses to Bob and Cheryl, but very slow responses to Jeffrey as each request must cross an ocean from Singapore to Virginia to request the data, then return from Virginia to Singapore to return it to Jeffrey. _This results in slower read times to some users_.

Instead of maintaining a single database instance, perhaps Twitter wants to have two instances that are exact replicas -- one in Virginia and one in Singapore. If we still want to maintain strong consistency, this means a user must get the same answer if she queries the Virginia instance or the Singapore instance at the same time. This could be implemented by a more complex system on database writes -- before Bob's tweet is committed to the database, it has to be submitted to both the Virginia instance and the Singapore instance. Now Bob's request needs to make the hop across the ocean and back. _This results in slower write times to some users_.

In the Dynamo paper, Amazon noted that strong consistency isn't important in all scenarios. In our example, it would be fine if Jeffrey and Cheryl saw slightly different versions of my profile even if they queried at the same time. Sometimes you can settle for _eventual consistency_, meaning different users will eventually see the same view of the data. Jeffrey will eventually see Bob's tweet in Singapore, but it may be at 2:32 PM rather than 2:30.

Strong consistency is important for certain use cases - think bank account balances - but less important for others, such as our Twitter example or the Amazon shopping cart, which was the impetus for Dynamo. For these use cases, speed and availability are more important than a consistent view of the world. By weakening the consistency model of a relational database, the Dynamo engineers were able to provide a database that better fit the needs of Amazon.com.

_Note: This section is a massive simplification of consistency, availability, and other concepts around databases and distributed systems. You should really look at this as a very simple primer rather than a definitive text._ 

#### Infinitely Scalable

The final key aspect of Dynamo is that it is infinitely scalable without any negative performance impacts. This aspect is a result of the relaxing of relational and consistency constraints from prior databases.

When scaling out a system, you can either vertically scale (use a larger server instance with more CPUs or RAM) or you can horizontally scale by splitting your data across multiple machines, each of which has a subset of your full dataset. Vertical scaling gets expensive and eventually hits limits based on available technology. Horizontal scaling is cheaper but more difficult to achieve.

To think about horizontal scaling, imagine you have a dataset of Users that you want to distribute across three machines. You could choose to split them across machines based on the last name of the Users -- A through H go on machine 1, I through Q go on machine 2, and R through Z go on machine 3. 

This is nice if you're getting a single User -- a call to retrieve Linda Duffy can go directly to machine 1 -- but can be slow if your query spans multiple machines. A query to get all users older than 18 will have to hit all three machines, resulting in slower responses.

Similarly, we saw in the previous section how strong consistency requirements can make it difficult to scale out. We would introduce latency during writes to make sure the write is committed to all nodes before returning to the writing user.

Relaxing these requirements makes it much easier for Dynamo to scale horizontally without sacrificing performance. DynamoDB uses [consistent hashing](https://en.wikipedia.org/wiki/Consistent_hashing) to spread items across a number of nodes. As the amount of data in your DynamoDB table increases, AWS can add additional nodes behind the scenes to handle this data.

DynamoDB avoids the multiple-machine problem by essentially requiring that all read operations use the primary key (other than Scans). From our Users example before, our primary key could be LastName, and Amazon would distribute the data accordingly. If you do need to query via Age, you would use a [secondary index](./key-concepts#secondary-indexes) to apply the same distribution strategy via a different key.

Finally, because DynamoDB allows for eventual consistency, it allows for easier replication strategies of your data. You can have your item copied onto three different machines and query any of them for increased throughput. It's possible one of the machines has a slightly different view of the item at different times due to the eventual consistency model, but this is a trade-off worth accepting for many use cases. Also, you may explicitly specify a strongly-consistent read if it is required for your application.

These changes make it possible for DynamoDB to provide query latencies in single-digit milliseconds for virtually unlimited amounts of data -- 100TB+.

Ready to dig in? [Set up your environment](./environment-setup) then [get started](./anatomy-of-an-item) with some operations.

## References

- [A Decade of Dynamo](http://www.allthingsdistributed.com/2017/10/a-decade-of-dynamo.html) post on Werner Vogel's blog
- [Dynamo: Amazon's Highly Available Key-value Store](http://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf)
- [CAP Theorum](https://en.wikipedia.org/wiki/CAP_theorem)
- [Amazon Takes Another Pass at NoSQL with DynamoDB](http://readwrite.com/2012/01/18/amazon-enters-the-nosql-market/).
