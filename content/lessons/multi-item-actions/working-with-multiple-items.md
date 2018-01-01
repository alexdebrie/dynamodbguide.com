---
title: "Working with Multiple Items"
description: "Learn how to create a table with a composite primary key and insert multiple items with AWS DynamoDB"
lesson: 1
chapter: 3
date: "1/1/2018"
type: "lesson"
---

In the previous chapter, we worked with a single Item at a time -- inserting, retrieving, updating, and deleting. In this chapter, we're going to work with multiple items at a time. We'll explore this in the context of a DynamoDB table that's using a _composite primary key_.

A composite primary key is useful for using DynamoDB as more than a simple key-value store. It allows you to work with a group of related items with a single query and enables some powerful use cases.

In this lesson, we'll create a table with a composite primary key. Then, we'll seed it with some data using the BatchWriteItem API call. In the next lessons, we'll work with this data using the Query and Scan API calls.

## Creating a table

Creating a table with a composite primary key is similar to [creating a table with a simple primary key](./inserting-retrieving-items#creating-a-table). You define the attributes and your key schema when creating the table. The main difference is that you'll need to define _two_ attributes rather than one. You then have to specify which attribute is your HASH key and which is your RANGE key.

The HASH key is how your data is partitioned, while the RANGE key is how that data is sorted within a particular HASH key. The HASH key is particularly important -- you can only grab data for a single HASH key in a Query operation. The HASH and RANGE keys allow for a one-to-many like structure -- for a single HASH key, there can be multiple RANGE keys.

When thinking about how to set up our data structure, think how you would fill in the blanks for the following query:

> **"Give me all of the ________ from a particular _______."**

The element you put in the first blank should be your RANGE key, while the element you put in the second blank should be your HASH key.

In our example, we're going to make an Orders table. Each Order is placed by a User and is given a specific OrderId. Using our question from above, we would ask **"Give me all of the _OrderIds_ for a particular _Username_"**, but we wouldn't ask "Give me all of the Usernames for a particular OrderId", as an Order is placed by a particular User. Given that, Username is our HASH key and OrderId is our RANGE key.

To create the UserOrdersTable, we'll use the CreateTable API call:

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
    --provisioned-throughput '{
      "ReadCapacityUnits": 1,
      "WriteCapacityUnits": 1
    }' \
    $LOCAL
```

And the response shows your table description:

```
{
    "TableDescription": {
        "TableArn": "arn:aws:dynamodb:ddblocal:000000000000:table/UserOrdersTable",
        "AttributeDefinitions": [
            {
                "AttributeName": "Username",
                "AttributeType": "S"
            },
            {
                "AttributeName": "OrderId",
                "AttributeType": "S"
            }
        ],
        "ProvisionedThroughput": {
            "NumberOfDecreasesToday": 0,
            "WriteCapacityUnits": 1,
            "LastIncreaseDateTime": 0.0,
            "ReadCapacityUnits": 1,
            "LastDecreaseDateTime": 0.0
        },
        "TableSizeBytes": 0,
        "TableName": "UserOrdersTable",
        "TableStatus": "ACTIVE",
        "KeySchema": [
            {
                "KeyType": "HASH",
                "AttributeName": "Username"
            },
            {
                "KeyType": "RANGE",
                "AttributeName": "OrderId"
            }
        ],
        "ItemCount": 0,
        "CreationDateTime": 1514657981.297
    }
}
```

This is very similar to when we created the UsersTable other than we've added a RANGE key in addition to a HASH key.

## Batch Write Item

Now we have our new table. To get the full use of these multi-Item actions, we'll need to load a fair bit of data into it. One way to load a bunch of data is to use the BatchWriteItem API call. This call allows you to make multiple (up to 25) PutItem and/or DeleteItem requests in a single call rather than making separate calls. You can even make requests to _different tables_ in a single call. 

There are some limitations of the BatchWriteAPI. First, you cannot use the UpdateItem API call with a BatchWriteItem request. Updates must be done individually. Second, you cannot specify conditions for your Put and Delete operations -- they're all-or-nothing.

When making a batch call, there are two different failure modes. First, the _entire request_ could fail due to an error in the request, such as trying to write to a table that doesn't exist, trying to write more than 25 Items, or exceeding the size limits for an Item or a batch.

Additionally, you could have _individual write requests_ that fail within the batch. This is most common when you exceed the write throughput for a given table, though it could also happen for AWS server-side errors. In this case, any unprocessed items will be returned in the response in an "UnprocessedItems" key.

At the bottom of this lesson is a (very long) BatchWriteItem request to paste into your terminal. It will insert 25 Items into our newly-created UserOrdersTable. Each Item has a Username, as required by the table's HASH key. It also has an OrderId to satisfy the table's RANGE key. The OrderId is a datestamp (e.g. 20171230) followed by a random integer. Finally, there is an Amount attribute that details the amount of the order.

In the [next lesson](./querying), we'll learn about Querying our table for multiple Items.

```bash
$ aws dynamodb batch-write-item \
    --request-items '{
        "UserOrdersTable": [
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "alexdebrie"},
                        "OrderId": {"S": "20160630-12928"},
                        "Amount": {"N": "142.23"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "daffyduck"},
                        "OrderId": {"S": "20170608-10171"},
                        "Amount": {"N": "18.95"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "daffyduck"},
                        "OrderId": {"S": "20170609-25875"},
                        "Amount": {"N": "116.86"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "daffyduck"},
                        "OrderId": {"S": "20160630-28176"},
                        "Amount": {"N": "88.30"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "yosemitesam"},
                        "OrderId": {"S": "20170609-18618"},
                        "Amount": {"N": "122.45"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "alexdebrie"},
                        "OrderId": {"S": "20170609-4177"},
                        "Amount": {"N": "27.89"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "alexdebrie"},
                        "OrderId": {"S": "20170608-24041"},
                        "Amount": {"N": "142.02"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "yosemitesam"},
                        "OrderId": {"S": "20170609-17146"},
                        "Amount": {"N": "114.00"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "yosemitesam"},
                        "OrderId": {"S": "20170609-9476"},
                        "Amount": {"N": "19.41"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "alexdebrie"},
                        "OrderId": {"S": "20160630-13286"},
                        "Amount": {"N": "146.37"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "alexdebrie"},
                        "OrderId": {"S": "20170609-8718"},
                        "Amount": {"N": "76.19"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "daffyduck"},
                        "OrderId": {"S": "20171129-29970"},
                        "Amount": {"N": "6.98"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "alexdebrie"},
                        "OrderId": {"S": "20170609-10699"},
                        "Amount": {"N": "122.52"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "alexdebrie"},
                        "OrderId": {"S": "20160630-25621"},
                        "Amount": {"N": "141.78"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "alexdebrie"},
                        "OrderId": {"S": "20170330-29929"},
                        "Amount": {"N": "80.36"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "yosemitesam"},
                        "OrderId": {"S": "20160630-4350"},
                        "Amount": {"N": "138.93"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "alexdebrie"},
                        "OrderId": {"S": "20170330-20659"},
                        "Amount": {"N": "47.79"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "alexdebrie"},
                        "OrderId": {"S": "20170115-20782"},
                        "Amount": {"N": "80.05"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "yosemitesam"},
                        "OrderId": {"S": "20170330-18781"},
                        "Amount": {"N": "98.40"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "yosemitesam"},
                        "OrderId": {"S": "20170330-1645"},
                        "Amount": {"N": "25.53"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "alexdebrie"},
                        "OrderId": {"S": "20170115-2268"},
                        "Amount": {"N": "37.30"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "alexdebrie"},
                        "OrderId": {"S": "20170609-8267"},
                        "Amount": {"N": "32.13"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "alexdebrie"},
                        "OrderId": {"S": "20170330-3572"},
                        "Amount": {"N": "126.17"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "alexdebrie"},
                        "OrderId": {"S": "20171129-28042"},
                        "Amount": {"N": "83.12"}
                    }
                }
            },
            {
                "PutRequest": {
                    "Item": {
                        "Username": {"S": "yosemitesam"},
                        "OrderId": {"S": "20170609-481"},
                        "Amount": {"N": "136.68"}
                    }
                }
            }
        ]
    }' \
    $LOCAL
```

And the response showing any unprocessed items:

```
{
    "UnprocessedItems": {}
}
```

