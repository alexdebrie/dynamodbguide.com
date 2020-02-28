---
title: "Additional Reading"
description: "External resources on AWS DynamoDB"
lesson: 1
chapter: 9
date: "1/5/2020"
type: "lesson"
---

### Articles:

- [SQL, NoSQL, and Scale: How DynamoDB scales where relational databases don't](https://www.alexdebrie.com/posts/dynamodb-no-bad-queries/) - This is a post of mine explaining the core architectural decisions that allow NoSQL databases to scale further than their SQL brethren. 
- [The What, Why, and When of Single-Table Design with DynamoDB](https://www.alexdebrie.com/posts/dynamodb-single-table/) - A deep look at what it means to do single-table design in DynamoDB and why you would want to. It also includes a few situations where you may want to _avoid_ single-table design.
- [Faux-SQL or NoSQL? Examining four DynamoDB Patterns in Serverless Applications](https://www.alexdebrie.com/posts/dynamodb-patterns-serverless/) - This is a post I wrote on the common data modeling patterns I see with DynamoDB in serverless applications.
- [Why Amazon DynamoDB isn't for everyone](https://read.acloud.guru/why-amazon-dynamodb-isnt-for-everyone-and-how-to-decide-when-it-s-for-you-aefc52ea9476) - My favorite post on this topic. Forrest Brazeal does a great job breaking down the pros and cons of DynamoDB.
- [From relational DB to single DynamoDB table: a step-by-step exploration](https://www.trek10.com/blog/dynamodb-single-table-relational-modeling/) - Another great post by Forrest Brazeal. It's a detailed walkthrough of how to use the single-table DynamoDB pattern in a complex use case.
- [Why the PIE theorem is more relevant than the CAP theorem](https://www.alexdebrie.com/posts/choosing-a-database-with-pie/) - Another post I wrote about choosing a database that includes consideration of DynamoDB.

### Videos:

- [Advanced Design Patterns for DynamoDB (reInvent 2017)](https://www.youtube.com/watch?v=jzeKPKpucS0). Rick Houlihan is a master of DynamoDB and has some great tips.
- [Advanced Design Pattens for DynamoDB (reInvent 2018)](https://www.youtube.com/watch?v=HaEPXoXVf2k). Rick Houlihan is back with more tips. The first half is similar to 2017, but the second half has different examples. Highly recommended. [Get the slides here](https://www.slideshare.net/AmazonWebServices/amazon-dynamodb-deep-dive-advanced-design-patterns-for-dynamodb-dat401-aws-reinvent-2018pdf).
- [Advanced Design Patterns for DynamoDB (reInvent 2019)](https://t.co/fRtp2X3Vgg?amp=1). The most recent edition of Rick Houlihan's DynamoDB talk. 
- [Data Modeling with DynamoDB (reInvent 2019)](https://www.youtube.com/watch?v=DIQVJqiSUkE). A gentler introduction to DynamoDB single-table concepts. Watch this video if Rick's is too advanced.
- [Using (and ignoring) DynamoDB Best Practices in Serverless (ServerlessConf NYC 2019)](https://acloud.guru/series/serverlessconf-nyc-2019/view/dynamodb-best-practices). This talk focuses on using DynamoDB in Serverless applications.

### Reference material:

- [Awesome DynamoDB](https://github.com/alexdebrie/awesome-dynamodb) -- A GitHub repo with DynamoDB links and resources.
- [DynamoDB landing page](https://aws.amazon.com/dynamodb/)
- [AWS Developer Guide Docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- [AWS CLI reference for DynamoDB](https://docs.aws.amazon.com/cli/latest/reference/dynamodb/index.html)
- [Boto3 (Python client library for AWS) docs](http://boto3.readthedocs.io/en/latest/reference/services/dynamodb.html)
- [Javascript client library for AWS](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html)
- [Document Client cheat sheet (Javascript)](https://github.com/dabit3/dynamodb-documentclient-cheat-sheet). Created by [Nader Dabit](https://twitter.com/dabit3).
