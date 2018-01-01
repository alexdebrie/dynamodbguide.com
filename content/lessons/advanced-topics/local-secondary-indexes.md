---
title: "Local Secondary Indexes"
description: "Learn about local secondary indexes with AWS DynamoDB"
lesson: 2
chapter: 4
date: "01/01/2018"
type: "lesson"
---

In the [previous lesson](./secondary-indexes), we learned some basics about secondary indexes. In this lesson, we'll dive deeper into local secondary indexes. First we'll cover some basics about local secondary indexes, then we'll walk through an example.

## Basics of Local Secondary Indexes

You can only add local secondary indexes on tables with composite primary keys. A local secondary index maintains the same HASH key as the underlying table while allowing for a different RANGE key.

Some additional notes about local secondary indexes:

- **Must be specified at table creation.** You cannot add a local secondary index to an existing table. It must be provided at creation. This is different than [global secondary indexes](./global-secondary-indexes).

- **10GB limit per HASH key.** For a given HASH key, you may only store 10GB of data. This includes the size of the items in the base table _plus_ the combined size of the items in all local secondary indexes. This is a tricky one and is a good reason for being judicious with your [projected attributes](./secondary-indexes#projected-attributes).

- **Consistency options.** For local secondary indexes, you may choose between strong consistency and eventual consistency, just like on the underlying table. Strong consistency will consume more read capacity but can be the right choice in some situations.

- **Shares throughput with underlying table.** All local secondary indexes use the read and write capacity units of the underlying table.

## Creating a Local Secondary Index

Let's see a local secondary index in action. Remember that it can only be used on a table with a composite primary key, so that rules out our [Users table](./inserting-retrieving-items#creating-a-table) from earlier. Let's apply it to our [UserOrdersTable](./working-with-multiple-items#creating-a-table) instead.

Recall that we did an example in the [filtering](./filtering#using-filters) lesson about searching for a particular User's Orders that exceeded a given amount. Because Amount wasn't a part of the primary key, we had to _first_ retrieve all Orders for a User, then apply the filter to return only those beyond a certain amount.

This query could be inefficient if we were paging through a large number of Orders for a User -- we might have to make multiple requests to find the small number of Orders over a given amount. Instead, we'll add a local secondary index using the Amount as a sort key. This will enable fast, specific lookups using the Amount column.

Unfortunately, local secondary indexes must be specified at time of table creation. First, we'll need to delete our table:

```bash
$ aws dynamodb delete-table \
    --table-name UserOrdersTable \
    $LOCAL
```

which will return a description of your table.

Then, let's recreate the table:

```bash
$ aws dynamodb create-table \
    --table-name UserOrdersTable \
    --attribute-definitions '[
      {
          "AttributeName": "Username",
          "AttributeType": "S"
      },
      {
          "AttributeName": "OrderId",
          "AttributeType": "S"
      },
      {
          "AttributeName": "Amount",
          "AttributeType": "N"
      }
    ]' \
    --key-schema '[
      {
          "AttributeName": "Username",
          "KeyType": "HASH"
      },
      {
          "AttributeName": "OrderId",
          "KeyType": "RANGE"
      }
    ]' \
    --local-secondary-indexes '[
      {
          "IndexName": "UserAmountIndex",
          "KeySchema": [
              {
                  "AttributeName": "Username",
                  "KeyType": "HASH"
              },
              {
                  "AttributeName": "Amount",
                  "KeyType": "RANGE"
              }
          ],
          "Projection": {
              "ProjectionType": "KEYS_ONLY"
          }
      }
    ]' \
    --provisioned-throughput '{
      "ReadCapacityUnits": 1,
      "WriteCapacityUnits": 1
    }' \
    $LOCAL
```

This is the same as the [CreateTable](./working-with-multiple-items#creating-a-table) command we initially issued for this table, with the additions of: (1) the "Amount" attribute definition, and (2) the "--local-secondary-indexes" flag.

Finally, load our 25 UserOrder Items into the table by following the [same BatchWriteItem](./working-with-multiple-items#batch-write-item) call from last chapter. I'm not going to re-paste it here as it's too long.

By this point, you should have 25 items in your recreated UserOrdersTable. You can check by running a quick Scan command to return the count:

```bash
$ aws dynamodb scan \
    --table-name UserOrdersTable \
    --select COUNT \
    $LOCAL
```

And it should return a count of 25 items:

```bash
{
    "Count": 25,
    "ScannedCount": 25,
    "ConsumedCapacity": null
}
```

## Querying a Local Secondary Index

Now that we have a table set up with a local secondary index, let's run a query against it. In our filter example, we looked for all of Daffy Duck's Orders that were over $100. We can now convert this directly to a Query without using a filter:

```bash
$ aws dynamodb query \
    --table-name UserOrdersTable \
    --index-name UserAmountIndex \
    --key-condition-expression "Username = :username AND Amount > :amount" \
    --expression-attribute-values '{
        ":username": { "S": "daffyduck" },
        ":amount": { "N": "100" }
    }' \
    $LOCAL
```

Note that we've removed our `--filter-expression` and put the filter logic into the `--key-condition-expression`. We also specified the `--index-name` that we want to query rather than hitting the table directly.

Let's look at the response:

```bash
{
    "Count": 1,
    "Items": [
        {
            "OrderId": {
                "S": "20170609-25875"
            },
            "Username": {
                "S": "daffyduck"
            },
            "Amount": {
                "N": "116.86"
            }
        }
    ],
    "ScannedCount": 1,
    "ConsumedCapacity": null
}
```

Just like the filter example, we received only one Item back that satisfied our conditions. However, look at the ScannedCount and Count. When we [ran this query with a filter](./filtering#using-filters), we scanned 4 Items. These were all of Daffy's orders. It then returned a Count of 1 Item that satisfied the filter.

When we queried the index, our ScannedCount is 1. This shows that we only retrieved 1 Item rather than all 4. This resulted in our query using a smaller number of read capacity units than with the filter example. When querying partitions with a large number of Items, this can make a huge difference in query speed and complexity.

Now that we understand local secondary indexes, let's move on to [global secondary indexes](./global-secondary-indexes).
