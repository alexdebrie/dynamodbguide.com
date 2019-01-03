---
title: "Global Secondary Indexes"
description: "Learn about global secondary indexes with AWS DynamoDB."
lesson: 3
chapter: 4
date: "01/01/2018"
type: "lesson"
---

In this example, we'll learn about _global secondary indexes_. Just like the last lesson, we'll cover the basics first before diving into an example using some tables we've already created.

## Basics of Global Secondary Indexes

Unlike local secondary indexes, you can add global secondary indexes to tables with either simple primary keys or composite primary keys. Further, you're not limited to creating a composite key schema for your index -- you can create a simple key schema. 

There are a few ways in which global secondary indexes differ from local secondary indexes:

- **Separate throughput.** You provision read and write capacity units for a global secondary index _separate_ than those units for the underlying table. This may add complexity and cost but also gives you flexibility to tailor the capacity to different workloads.

- **Eventual consistency.** When writing an Item to a table, it is asynchronously replicated to global secondary indexes. This means you _may_ get different results when querying a table and a global secondary index at the same time. You do not have the ability to specify strong consistency.

- **No partition key size limits.** Partition keys are limited to 10GB between the table Items and all local secondary indexes. Global secondary indexes are not counted in these limits.

- **Use on any table.** Local secondary indexes may only be used on tables with composite primary keys. Global secondary indexes do not have this restriction -- you can use them on tables with simple or composite primary keys.

- **Use with any key schema.** When specifying the key schema for your global secondary index, you can use either a simple or a composite key schema.

The last two points can be confusing. The first refers to the primary key schema of the _underlying table_, while the second refers to the key schema of the _secondary index_ you're creating.

## Creating a Global Secondary Index

Like local secondary indexes, you may specify a global secondary index when you initially create a table. However, you may also add a global secondary index after a table is already created. DynamoDB will backfill the global secondary index based on the existing data in the table.

In this example, let's show how we might use a _sparse index_ for our global secondary index. A sparse index is when not every Item contains the attribute you're indexing. Only Items with the attribute(s) matching the key schema for your index will be copied into the index, so you may end up with fewer Items in the index than in the underlying table.

Imagine we want to keep track of Orders that were returned by our Users. We'll store the date of the return in a ReturnDate attribute. We'll also add a global secondary index with a composite key schema using ReturnDate as the HASH key and OrderId as the RANGE key.

The API call for this is as follows:

```bash
$ aws dynamodb update-table \
    --table-name UserOrdersTable \
    --attribute-definitions '[
      {
          "AttributeName": "ReturnDate",
          "AttributeType": "S"
      },
      {
          "AttributeName": "OrderId",
          "AttributeType": "S"
      }
    ]' \
    --global-secondary-index-updates '[
        {
            "Create": {
                "IndexName": "ReturnDateOrderIdIndex",
                "KeySchema": [
                    {
                        "AttributeName": "ReturnDate",
                        "KeyType": "HASH"
                    },
                    {
                        "AttributeName": "OrderId",
                        "KeyType": "RANGE"
                    }
                ],
                "Projection": {
                    "ProjectionType": "ALL"
                },
                "ProvisionedThroughput": {
                    "ReadCapacityUnits": 1,
                    "WriteCapacityUnits": 1
                }
            }
        }
    ]' \
    $LOCAL
```

The syntax to add a global secondary index is similar to that of adding a local secondary index. Note that I didn't need to redefine the keys of my underlying table in the `--attribute-definitions` section, only the new attribute that I was using for the index.

## Querying a Global Secondary Index

Querying a global secondary index is just like using a local secondary index -- you use the Query or Scan operations and specify the name of the index you're using.

One thing that's different in this example is that we've set up a sparse index. Our HASH key is ReturnDate, but none of the Items we've written have a ReturnDate attribute. Let's do a Scan on the index just to confirm:

```bash
$ aws dynamodb scan \
    --table-name UserOrdersTable \
    --index-name ReturnDateOrderIdIndex \
    $LOCAL
```

The response is empty -- no Items are present in the index:

```bash
{
    "Count": 0,
    "Items": [],
    "ScannedCount": 0,
    "ConsumedCapacity": null
}
```

Let's use the `BatchWriteItem` API call to insert a few Orders that have been returned:

```bash
$ aws dynamodb batch-write-item \
    --request-items '{
        "UserOrdersTable": [
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "alexdebrie"},
                        "OrderId": {"S": "20160630-12928"},
                        "Amount": {"N": "142.23"},
                        "ReturnDate": {"S": "20160705"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "daffyduck"},
                        "OrderId": {"S": "20170608-10171"},
                        "Amount": {"N": "18.95"},
                        "ReturnDate": {"S": "20170628"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "daffyduck"},
                        "OrderId": {"S": "20170609-25875"},
                        "Amount": {"N": "116.86"},
                        "ReturnDate": {"S": "20170628"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "yosemitesam"},
                        "OrderId": {"S": "20170609-18618"},
                        "Amount": {"N": "122.45"},
                        "ReturnDate": {"S": "20170615"}
                    }
                }
            }
        ]
    }' \
    $LOCAL
```

These four Items are overwriting four of our previous Items by adding a ReturnDate. Usually this would happen individually with an UpdateItem call, but this will suffice for the experiment.

Let's try running our Scan operation again:

```bash
$ aws dynamodb scan \
    --table-name UserOrdersTable \
    --index-name ReturnDateOrderIdIndex \
    $LOCAL
```

Success! We receive our 4 Items back:

```bash
{
    "Count": 4,
    "Items": [
        {
            "OrderId": {
                "S": "20160630-12928"
            },
            "Username": {
                "S": "alexdebrie"
            },
            "Amount": {
                "N": "142.23"
            },
            "ReturnDate": {
                "S": "20160705"
            }
        },
        {
            "OrderId": {
                "S": "20170609-18618"
            },
            "Username": {
                "S": "yosemitesam"
            },
            "Amount": {
                "N": "122.45"
            },
            "ReturnDate": {
                "S": "20170615"
            }
        },
        {
            "OrderId": {
                "S": "20170608-10171"
            },
            "Username": {
                "S": "daffyduck"
            },
            "Amount": {
                "N": "18.95"
            },
            "ReturnDate": {
                "S": "20170628"
            }
        },
        {
            "OrderId": {
                "S": "20170609-25875"
            },
            "Username": {
                "S": "daffyduck"
            },
            "Amount": {
                "N": "116.86"
            },
            "ReturnDate": {
                "S": "20170628"
            }
        }
    ],
    "ScannedCount": 4,
    "ConsumedCapacity": null
}
```

This global secondary index could enable use cases, such as finding all the returns entered yesterday, that would require full table scans without the index.

This concludes the lesson on global secondary indexes. The next advanced topic is [DynamoDB Streams](./dynamodb-streams).
