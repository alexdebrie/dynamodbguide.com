---
title: "Secondary Indexes"
description: "Learn about secondary indexes with AWS DynamoDB."
lesson: 1
chapter: 4
date: "03/20/2019"
type: "lesson"
---

Up to this point, most read operations have used a table's primary key directly, either through the [GetItem](./inserting-retrieving-items#get-item) call or the [Query](./querying) call. Using a table's primary key is the most efficient way to retrieve Items and avoids using the slow [Scan](./scans) operation.

However, the requirement of using a primary key limits the access patterns of a table. In our Query example, we saw that we could include the order date in our RANGE key to enable fast lookups of a customer's orders by date. Yet this means we don't have a fast way of accessing customer orders by the amount of the order, which is a non-key attribute. To retrieve a subset of a customer's orders based on amount, we would need to use a [filter](./filtering) which is only applied after all the customer's orders are retrieved.

Fortunately, DynamoDB has a concept of **secondary indexes**. Secondary indexes allow you to specify alternate key structures which can be used in Query or Scan operations (but _not_ GetItem operations).

In this lesson, we'll discuss the two types of secondary indexes, and we'll cover some basic rules for working with secondary indexes.

## Types of Secondary Indexes

There are two types of secondary indexes: _local secondary indexes_ and _global secondary indexes_.

**Local secondary indexes** can be used on a table with a composite primary key to specify an index with the same HASH key but a different RANGE key for a table. This is useful for the scenario mentioned in the intro above -- we still want to partition our data by Username, but we want to retrieve Items by a different attribute (Amount).

**Global secondary indexes** can be used to specify a completely different key structure for a table. If you had a table with a composite primary key, you could have a global secondary index with a simple key. Or, you could add a global secondary index with a completely different HASH key and RANGE key. If your table has a simple primary key, you could add a global secondary index with a composite key structure.

Secondary indexes are very powerful and enable a much more flexible query structure. 

## Basics of Secondary Indexes

There are a few basics of secondary indexes that are worth knowing:

- **No uniqueness requirement**. Recall that for a table's primary key, _every item is uniquely identified by its primary key_. Thus, you can't have two Items with the same key in a table.

  This requirement is not applicable to secondary indexes. You may have Items in your secondary index with the exact same key structure.
  
- **Secondary index attributes aren't required.** When writing an Item, you _must_ specify the primary key elements. This isn't true with secondary indexes -- you may write an Item that doesn't include the attributes for secondary indexes. If you do this, the Item won't be written to the secondary index. This is known as a _sparse index_ and can be a very useful pattern.

- **Index limits per table.** You may create 20 global secondary indexes and 5 local secondary indexes per table.

## Projected Attributes

When provisioning a secondary index, you specify which attributes you want to _project_ into the index. This states which attributes will be available from the index directly without needing to make an additional call to the underlying table to retrieve attributes.

Your options for attribute projections are:

- **KEYS_ONLY**: Your index will include only the keys for the index and the table's underlying partition and sort key values, but no other attributes.

- **ALL:** The full Item is available in the secondary index with all attributes.

- **INCLUDE:** You may choose to name certain attributes that are projected into the secondary index.

Consider your query patterns carefully when choosing your projections. DynamoDB charges based on the amount of data indexed, so projecting all of your attributes may result in excess charges. On the other hand, you want to avoid making two queries to answer a question -- one to query an index for relevant keys, and a second to retrieve the needed attributes on a table for the matching keys.

Next, let's look deeper at [local secondary indexes](./local-secondary-indexes).
