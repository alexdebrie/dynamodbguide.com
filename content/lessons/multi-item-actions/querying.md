---
title: "Querying"
description: "Learn how to retrieve multiple items with the Query operation with AWS DynamoDB"
lesson: 2
chapter: 3
date: "1/1/2018"
type: "lesson"
---

Querying is a very powerful operation in DynamoDB. It allows you to select multiple Items that have the same partition ("HASH") key but different sort ("RANGE") keys.

In this lesson, we'll learn some basics around the Query operation including using Queries to:

- [retrieve all Items with a given partition key](#retrieving-all-items-with-a-given-partition-key);
- [use key expressions](#using-key-expressions) to limit Items based on the RANGE key; and
- use projection expressions to [narrow the response](#narrowing-your-query-results) for your Query.


Before reading this section, you should understand [DynamoDB expressions](./expression-basics).

## Retrieving All Items with a Given Partition Key

In our previous chapter, we looked at working with individual Items at a time. That can be useful in some scenarios, such as working with Users. We're usually manipulating a single User at a time, whether retrieving a User's profile or changing a User's name.

It's less helpful in other situations, such as working with Orders. Occasionally we want to grab a specific Order, but we also may want to display all the Orders for a particular User. It would be inefficient to store the different partition keys for each User's Orders and query those Items separately.

Let's see how we can satisfy the latter request using the Query API call. First, we'll retrieve all of the Orders for our `daffyduck` User. The `--key-condition-expression` option is the important thing to view here. It's how we define which items to select.

```bash
$ aws dynamodb query \
    --table-name UserOrdersTable \
    --key-condition-expression "Username = :username" \
    --expression-attribute-values '{
        ":username": { "S": "daffyduck" }
    }' \
    $LOCAL
```

It returns with all four of Daffy's Orders:

```bash
{
    "Count": 4,
    "Items": [
        {
            "OrderId": {
                "S": "20160630-28176"
            },
            "Username": {
                "S": "daffyduck"
            },
            "Amount": {
                "N": "88.3"
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
            }
        },
        {
            "OrderId": {
                "S": "20171129-29970"
            },
            "Username": {
                "S": "daffyduck"
            },
            "Amount": {
                "N": "6.98"
            }
        }
    ],
    "ScannedCount": 4,
    "ConsumedCapacity": null
}
```

This is really useful. On an Orders overview page, we could show all of a User's Orders with the ability to drill into a particular Order if the User desired.

## Using Key Expressions

When querying to return Items, you might want to further limit the Items returned rather than returning all Items with a particular HASH key.

For example, when [designing our table](./working-with-multiple-items#creating-a-table), we decided we wanted to answer the query:

> Give me all of the OrderIds for a particular Username.

This is useful generally, but we might want to add something like SQL's WHERE clause to the end:

> Give me all of the OrderIds for a particular Username **where the Order was placed in the last 6 months**.

OR

> Give me all of the OrderIds for a particular Username **where the Amount was greater than $50**.

There are two different ways we can handle this further segmentation. The ideal way is to build the element we want to query into the RANGE key. This allows us to use Key Expressions to query our data, allowing DynamoDB to quickly find the Items that satisfy our Query.

A second way to handle this is with [filtering](./filtering) based on non-key attributes. This is less efficient than Key Expressions but can still be helpful in the right situations.

In this section, we'll see how to use Key Expressions to narrow our results. We've already used the `--key-condition-expression` option to indicate the HASH key we want to use with our Query. We can also include a RANGE key value _or_ an expression to operate on that RANGE key.

Recall that in our RANGE key of OrderId, we formatted it as `<OrderDate>-<RandomInteger>`. Starting with the OrderDate in our RANGE key allows us to query by order date using the [expression syntax](./expression-basics).

For example, if we wanted all Orders from 2017, we would make sure our OrderId was between "20170101" and "20180101":

```bash
aws dynamodb query \
    --table-name UserOrdersTable \
    --key-condition-expression "Username = :username AND OrderId BETWEEN :startdate AND :enddate" \
    --expression-attribute-values '{
        ":username": { "S": "daffyduck" },
        ":startdate": { "S": "20170101" },
        ":enddate": { "S": "20180101" }
    }' \
    $LOCAL
```

Our results return three Items rather than all four of Daffy's Orders:

```bash
{
    "Count": 3,
    "Items": [
        {
            "OrderId": {
                "S": "20170608-10171"
            },
            "Username": {
                "S": "daffyduck"
            },
            "Amount": {
                "N": "18.95"
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
            }
        },
        {
            "OrderId": {
                "S": "20171129-29970"
            },
            "Username": {
                "S": "daffyduck"
            },
            "Amount": {
                "N": "6.98"
            }
        }
    ],
    "ScannedCount": 3,
    "ConsumedCapacity": null
}
```

Daffy's fourth order was in 2016 so it did not satisfy our Key Expression.

These Key Expressions are very useful for enabling more specific query patterns, but note the limitations. Because the Key Expression can only operate on the HASH and RANGE key, you need to build the relevant data into the keys directly. Further, it limits the number of query patterns you can enable. Choosing to start your RANGE key with the OrderDate means you can't do a Key Expression based on the Amount of the Order.

In future lessons, we'll see other ways to enable more advanced queries, including with [filters](./filtering) or by using [global secondary indexes](./global-secondary-indexes) and [local secondary indexes](./local-secondary-indexes).

## Narrowing Your Query Results

In the responses above, the Query result is returning full Item that satisfies our Query request. It's not so bad in our example above with small Items. With larger Items, it can increase your response size in undesirable ways.

The Query API call allows for a `--projection-expression` option similar to the [GetItem](./inserting-retrieving-items#get-item) call we explored previously. This allows you to limit the Items to return just the attributes you care about.

For example, if we just wanted to return the Amounts for Daffy's Orders, we could pass a projection expression accordingly:

```bash
$ aws dynamodb query \
    --table-name UserOrdersTable \
    --key-condition-expression "Username = :username" \
    --expression-attribute-values '{
        ":username": { "S": "daffyduck" }
    }' \
    --projection-expression 'Amount' \
    $LOCAL
```

And the response contains only the Amount:

```bash
{
    "Count": 4,
    "Items": [
        {
            "Amount": {
                "N": "88.3"
            }
        },
        {
            "Amount": {
                "N": "18.95"
            }
        },
        {
            "Amount": {
                "N": "116.86"
            }
        },
        {
            "Amount": {
                "N": "6.98"
            }
        }
    ],
    "ScannedCount": 4,
    "ConsumedCapacity": null
}
```

Note that both responses so far have included a "Count" key that shows how many Items were returned in the response. If you want to get _just_ the count of Items that satisfy a Query, you can use the `--select` option to return that:

```bash
$ aws dynamodb query \
    --table-name UserOrdersTable \
    --key-condition-expression "Username = :username" \
    --expression-attribute-values '{
        ":username": { "S": "daffyduck" }
    }' \
    --select COUNT \
    $LOCAL
```

And the response:

```bash
{
    "Count": 4,
    "ScannedCount": 4,
    "ConsumedCapacity": null
}
```

In this lesson, we covered the basics of the Query API call. I think it's the most powerful part of DynamoDB, but it requires careful data modeling to get full value. In the next lesson, we'll talk about [Scans](./scans) which is a much blunter instrument than the Query call.
