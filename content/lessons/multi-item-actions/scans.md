---
title: "Scans"
description: "Learn how to scan your AWS DynamoDB table."
lesson: 3
chapter: 3
date: "1/1/2018"
type: "lesson"
---

In this lesson, we'll talk about using Scans with DynamoDB. The Scan call is the bluntest instrument in the DynamoDB toolset. By way of analogy, the GetItem call is like a pair of tweezers, deftly selecting the exact Item you want. The Query call is like a shovel -- grabbing a larger amount of Items but still small enough to avoid grabbing everything. 

The Scan operation is like a payloader, grabbing everything in its path:

![scan payloader](https://user-images.githubusercontent.com/6509926/34457385-d95c9ff2-ed74-11e7-86e0-bbf191325502.jpg)

_The Scan call, reporting for duty._

Before we dive too deeply into the Scan call, I want you to say the following words out loud:

**_I will never use the Scan operation unless I know what I am doing._**

The Scan operation operates on your _entire_ table. For tables of real size, this can quickly use up all of your Read Capacity. If you're using it in your application's critical path, it will be very slow in returning a response to your users.

The Scan operation generally makes sense only in the following situations:

- you have a _very_ small table;
- you're exporting all of your table's data to another storage system; or
- you use [global secondary indexes](./global-secondary-indexes) in a special way to set up a work queue (very advanced).

With these caveats out of the way, let's explore the Scan call.

# Scan basics

The Scan call is likely the easiest of all DynamoDB calls. Simply provide a table name, and it will return all Items in the table (up to a 1MB limit):

```bash
$ aws dynamodb scan \
    --table-name UserOrdersTable \
    $LOCAL
```

The response (truncated for brevity):

```bash
{
    "Count": 25,
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
        ...
        {
            "OrderId": {
                "S": "20171129-28042"
            },
            "Username": {
                "S": "alexdebrie"
            },
            "Amount": {
                "N": "83.12"
            }
        }
    ],
    "ScannedCount": 25,
    "ConsumedCapacity": null
}
```

As you can see, it returned all of our Items back to us.

Like the GetItem and Query calls, you can use a `--projection-expression` to specify the particular attributes you want returned to you. I'll skip the example here as it's similar to the previously given examples.

DynamoDB has a 1MB limit on the amount of data it will retrieve in a single request. Scans will often hit this 1MB limit if you're using your table for real use cases, which means you'll need to paginate through results.

If you hit the 1MB limit with a Scan, it will return a "NextToken" key in the response. You can use the value given with the `--starting-token` option to continue scanning from the location you previously ended.

You can test this behavior by passing a `--max-items` limit in our table. Let's make a Scan request with a max items limit of 1:

```bash
$ aws dynamodb scan \
    --table-name UserOrdersTable \
    --max-items 1 \
    $LOCAL
```

The response includes a single Item, plus a NextToken to continue our Scan:

```bash
{
    "Count": 25,
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
        }
    ],
    "NextToken": "eyJFeGNsdXNpdmVTdGFydEtleSI6IG51bGwsICJib3RvX3RydW5jYXRlX2Ftb3VudCI6IDF9",
    "ScannedCount": 25,
    "ConsumedCapacity": null
}
```

## Parallel Scans

One use case for Scans is to export the data into cold storage or for data analysis. If you have a large amount of data, scanning through a table with a single process can take quite a while.

To alleviate this, DynamoDB has the notion of _Segments_ which allow for parallel scans. When making a Scan, a request can say how many Segments to divide the table into and which Segment number is claimed by the particular request. This allows you to spin up multiple threads or processes to scan the data in parallel.

Even with our small amount of data, we can test this out. Let's say we want to segment our table into three segments to be processed separately. One process could say there are 3 total segments and that it wants the items for segment "1":

```bash
$ aws dynamodb scan \
    --table-name UserOrdersTable \
    --total-segments 3 \
    --segment 1 \
    $LOCAL
```

You can see the response only has 11 items, rather than the full 25:

```bash
{
    "Count": 11,
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
        ...
        {
            "OrderId": {
                "S": "20170609-9476"
            },
            "Username": {
                "S": "yosemitesam"
            },
            "Amount": {
                "N": "19.41"
            }
        }
    ],
    "ScannedCount": 11,
    "ConsumedCapacity": null
}
```

Segments are zero-indexed, though I had trouble when trying to use Segment "0" with DynamoDB Local -- it kept returning 0 elements.

In the next section, we'll learn about [filtering](./filtering) your Query and Scan operations.
