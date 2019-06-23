---
title: "DynamoDB Streams"
slug: "dynamodb-streams"
lesson: 4
chapter: 4
date: "01/01/2018"
type: "lesson"
---

## DynamoDB stream basics

During or after the creation of a table you can activate a stream for the table. When this is done, some or all operations on the table are pushed onto this stream as the operation takes place. 

Under the covers, this stream behaves just like a regular Kinesis stream, so many of the patterns to work with it are very similar.

You can choose from four types of behaviour when activating a stream:

- **KEYS_ONLY** - this will only write the key attributes of modified items to the stream
- **NEW_IMAGE** - this will write the full new item (post modification) to the stream
- **OLD_IMAGE** - this will write the full old item (pre modification) to the stream
- **NEW_AND_OLD_IMAGES** - this will write both old and new item version to the stream

Each table can have exactly one stream and when active it will be returned on the `LatestStreamArn` attribute of a `DescribeTable` call. The ARN will have this pattern:

```
arn:aws:dynamodb:(region):(account id):table/(table name)/stream/(ISO time stamp)
```

This stream can be accessed like any other Kinesis stream or - and that might be the more common way - hooked up to a lambda function to process stream items.

## Common usage patterns

**Post-write data processing**

Think tiggers in "classic" database solutions. Some data changes, something needs to happen. The main - and important - difference with DynamoDB streams is that items on the stream give you a post-write view of the data. So unlike classic triggers there is no option to "roll back" or prevent the change from happening. And depending on your application you might handle the stream in almost real-time or way later. The stream will keep the items for up to 24 hours.

The probably most common way of handling DynamoDB stream items is by having a Lambda function listen to the stream. You can do that by using the Lambda console or by using a `AWS::Lambda::EventSourceMapping` resource in your Cloudformation template. As part of that action you need to decide on the `BatchSize` the underlying infrastructure will pass into your function. Your function need to be able to handle that. If you configure a batch size of 150 you will receive an array of up to 150 items from the DynamoDB stream. As usual in Lambda, you need to think about your business logic, also in terms of memory and timeout settings to come up with a batch size that works best.

A DynamoDB stream item would look similar to this (with a couple of attributes removed for clarity):

```
{
   "Records":[
      {
         "eventID":"1",
         "eventName":"INSERT",
         "dynamodb":{
            "Keys":{
               "MyPartitionKey":{
                  "S":"f616ccf8-94da-48b5-9c8e-8ea8bc701c16"
               }
            },
            "NewImage":{
               "MyData":{
                  "S":"This is a new item!"
               },
               "MyPartitionKey":{
                  "S":"f616ccf8-94da-48b5-9c8e-8ea8bc701c16"
               }
            }
         }
      },
      {
         "eventID":"2",
         "eventName":"MODIFY",
         "dynamodb":{
            "Keys":{
               "MyPartitionKey":{
                  "S":"899ff269-47b4-4aca-aac1-a7da2c528512"
               }
            },
            "NewImage":{
               "MyData":{
                  "S":"This is the new attribute data"
               },
               "MyPartitionKey":{
                  "S":"899ff269-47b4-4aca-aac1-a7da2c528512"
               }
            },
            "OldImage":{
               "Message":{
                  "S":"This is the old attribute data"
               },
               "MyPartitionKey":{
                  "S":"899ff269-47b4-4aca-aac1-a7da2c528512"
               }
            }
         }
      },
      {
         "eventID":"3",
         "eventName":"REMOVE",
         "dynamodb":{
            "Keys":{
               "MyPartitionKey":{
                  "S":"14cb3e02-d5f4-4c4a-b7d5-2811c7055552"
               }
            },
            "OldImage":{
               "MyData":{
                  "S":"Some data"
               },
               "MyPartitionKey":{
                  "S":"14cb3e02-d5f4-4c4a-b7d5-2811c7055552"
               }
            }
         }
      }
   ]
}
```

This is an array of three items from a stream. The lambda code now can react to whatever attribute is relevant.

**eventID** is the unique ID of the stream item. Use this for logging, tracing, de-duplication (think idempotency!)

**eventName** tells you wheter an item was added, changed or removed, so you can react accordingly. Be aware that for _NEW_AND_OLD_IMAGES_ type streams INSERT events only have the NewImage element, REMOVE events only have the OldImage element.

With this information, your lambda function can react to changes on the stream, like processing data right away, or sending to downstream services.

## Aggregations ##

Another common use case for DynamoDB stream processing is aggregating data as the table changes.

As DynamoDB is not designed to deliver search engine capabilities and as such is not built to let you aggregate table data natively.

A good approach though, is to use the stream of a DynamoDB table to listen to changes as they come through and in the processing lambda function to whatever aggregation is needed.

This could look roughly like this:

```
var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName:"...",
    Key: {
        "MyPartitionKey" : "AggSumOfSomething"
    },
    UpdateExpression: "add TheSum = :countToAdd",
    ExpressionAttributeValues:{
        ":countToAdd":value
    }
};

docClient.update(params,callback);
```

In this case, you would have a dedicated item in your table with a partition key of _AggSumOfSomething_ that you would use to keep track of attribute values in your table items. Of course, if _value_ is negative it would be subtracted from the aggregate.

**Careful:** Don't create yourself a hot partition by firing to much at this single aggregate item. If you have to, look up "write sharding". Also, obviously the aggregate is eventual consistent as you probably can't guarantee live processing of you stream at all time.

## Things to look out for

**Idempotency** - If you process a DynamoDB stream in batches and your processing app or function fails then the stream iterator will not advance. So the next invocation will receive the same batch again. 

**Stream Partitioning** - If you use a lambda to process a DynamoDB stream you might get parallel invocations if your table is under heavy write load. Assume you are looking at at least one stream partition per DynamoDB table partion. Be aware that in this case there is no guaranteed ordering of *the processing* of the stream items by a lambda function.