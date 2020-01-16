---
title: "Filtering"
description: "Learn how to filter your DynamoDB queries"
lesson: 4
chapter: 3
date: "1/1/2018"
type: "lesson"
---

In previous sections, we've covered key expressions, condition expressions, projection expressions, and update expressions. This lesson discusses the final kind of expression -- _filter expressions_. 

Filter expressions are used to apply server-side filters on Item attributes _before_ they are returned to the client making the call. Before we dig too deeply into filters, let's first understand what's happening during a Query or Scan API call. 

## Breakdown of a DynamoDB API Call

For the DynamoDB Query and Scan operations, there are three separate steps happening on the DynamoDB server:

1. **Retrieve** the requested data. This step looks at Starting Token (if provided) for both types of operations, and the Key Expression in a Query operation.

2. (Optionally) **Filter** the data retrieved in step 1. This includes applying filters as described in this section or projection expressions as discussed in previous lessons.

3. **Return** the data to the client.

An important note is that any limitations on reads are applied in Step 1, _before_ a filter or projection expression is applied. If you retrieve 100KB of data in Step 1 but filter it down to 1KB of data in Step 2, you will consume the Read Capacity Units for 100KB of data, not the 1KB that it was filtered to. Further, there is a 1MB limit that is applied to all operations, regardless of the read capacity units on a table.

Filtering and projection expressions _aren't_ a magic bullet - they won't make it easy to quickly query your data in additional ways. However, they can save network transfer time by limiting the number and size of items transferred back to your network. They can also simplify application complexity by pre-filtering your results rather than requiring application-side filtering.

> For more on filter expressions and when to use them, check out this post on [When to use (and when not to use) DynamoDB Filter Expressions](https://www.alexdebrie.com/posts/dynamodb-filter-expressions/).

## Using Filters

Filter expressions are just like [key expressions](./querying#using-key-expressions) on Queries -- you specify an attribute to operate on and an expression to apply.

Let's reuse our previous Query to find Daffy Duck's orders. This time, we're looking for the big ticket orders, so we'll add a filter expression to return Orders with Amounts over $100:

```bash
$ aws dynamodb query \
    --table-name UserOrdersTable \
    --key-condition-expression "Username = :username" \
    --filter-expression "Amount > :amount" \
    --expression-attribute-values '{
        ":username": { "S": "daffyduck" },
        ":amount": { "N": "100" }
    }' \
    $LOCAL
```

The response includes only one Order:

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
    "ScannedCount": 4,
    "ConsumedCapacity": null
}
```

Another note -- look at the difference between "ScannedCount" and "Count". ScannedCount refers to the number of Items retrieved in Step 1 above. Count refers to the number of Items returned to the client.

Previously, these numbers were the same as we weren't filtering the retrieved items. Now that we've applied a filter, we see there were 4 total Orders for Daffy Duck but only 1 of them had an amount over $100. We consumed read capacity for those 4 scanned units, but only 1 was returned to us.

One final note: _Filter expressions may not be used on primary key elements in a Query operation_. This makes sense as you can just use the Key Expression if you want to apply an expression on the primary key elements. This limitation does not apply to Scan operations -- you may use filter expressions on primary keys with a Scan.

This concludes the chapter on working with multiple Items. In the [next section](./secondary-indexes), we'll look at advanced topics like secondary indexes and DynamoDB streams.
