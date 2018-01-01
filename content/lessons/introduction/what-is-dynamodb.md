---
title: "What is DynamoDB?"
description: "Background on DynamoDB, the NoSQL database provided by AWS"
lesson: 1
chapter: 1
date: "1/1/2018"
type: "lesson"
---

[DynamoDB](https://aws.amazon.com/dynamodb/) is a hosted NoSQL database offered by Amazon Web Services (AWS). It offers:

- *reliable performance* even as it scales;
- a *managed experience*, so you won't be SSH-ing into servers to upgrade the crypto libraries;
- a *small, simple API* allowing for simple key-value access as well as more advanced query patterns.

DynamoDB is a particularly good fit for the following use cases:

**Applications with large amounts of data and strict latency requirements**. As your amount of data scales, JOINs and advanced SQL operations can slow down your queries. With DynamoDB, your queries have predictable latency up to any size, including [over 100 TBs](https://medium.com/building-timehop/one-year-of-dynamodb-at-timehop-f761d9fe5fa1)!

**Serverless applications using AWS Lambda**. [AWS Lambda](https://aws.amazon.com/lambda/) provides auto-scaling, stateless, ephemeral compute in response to event triggers. DynamoDB is accessible via an HTTP API and performs authentication & authorization via IAM roles, making it a perfect fit for building Serverless applications.

**Data sets with simple, known access patterns**. If you're generating recommendations and serving them to users, DynamoDB's simple key-value access patterns make it a fast, reliable choice. 

### Ready to learn more?

Start with the [key concepts](./key-concepts) to learn about tables, items, and other basic elements of DynamoDB. If you want the computer science background on DynamoDB, check out the section on the [Dynamo Paper](./the-dynamo-paper). 

If you want to get your hands dirty, [set up your environment](./environment-setup) then start with the section on [working with single items](./anatomy-of-an-item). Then you can move on to [working with multiple items](./working-with-multiple-items) using Queries and Scans. 

Want the advanced stuff? Power up your tables with [secondary indexes](./secondary-indexes) and [DynamoDB Streams](./dynamodb-streams).

Still want more? Head to [Additional Reading](./additional-reading) to find the best community resources on DynamoDB.
