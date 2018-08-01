---
title: "Environment Setup"
description: "Set up your local environment to use AWS DynamoDB."
lesson: 4
chapter: 1
date: "01/01/2018"
type: "lesson"
---

In many of the subsequent lessons, we'll be directly interacting with the AWS DynamoDB APIs. To do this, we'll need to set up our environment.

## Install the AWS CLI

The [AWS CLI](https://aws.amazon.com/cli/) is a nice command line utility for interacting with AWS services. 

```
$ pip install awscli
```

If you have trouble installing it, [check the install instructions here](http://docs.aws.amazon.com/cli/latest/userguide/installing.html).

## Get IAM credentials

If you want to use a real AWS account, you'll need to set up your environment with the proper IAM credentials. You can read the AWS docs on doing that [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#cli-quick-configuration).

The quickest route is to create an IAM profile with full DynamoDB permissions. The Policy statement would look like:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:*"
      ],
      "Resource": "*"
    }
  ]
}
```

Once you have the keys for your IAM user, you can add your profile with `aws configure`:

```bash
$ aws configure
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-west-2
Default output format [None]: json
```


## (Optional) Use DynamoDB Local

AWS has a downloadable version of DynamoDB that you can run locally. This is ideal if you don't want to configure a real AWS account or if you want to avoid any AWS charges.

To use it, download the zip file and unzip it:

```bash
$ curl -O https://s3-us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.zip
$ unzip dynamodb_local_latest.zip
$ rm dynamodb_local_latest.zip
```

Then start your DynamoDB local instance:

```bash
$ java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb

Initializing DynamoDB Local with the following configuration:
Port:	8000
InMemory:	false
DbPath:	null
SharedDb:	true
shouldDelayTransientStatuses:	false
CorsParams:	*
```

If you see the initialization message in your terminal, you've successfully started the DynamoDB Local emulator. You're now ready to get started.

## The `$LOCAL` variable

If you want to use the DynamoDB local emulator, you'll need to append the following flag to all commands given in the examples:

```bash
--endpoint-url http://localhost:8000
```

I don't like typing the full flag every time so I export it to a variable and use that shorthand:

```bash
$ export LOCAL="--endpoint-url http://localhost:8000"

$ aws dynamodb list-tables $LOCAL
```

All examples will include the `$LOCAL` flag for easier copy-paste functionality. If you are using a real AWS account rather than the DynamoDB local emulator, make sure the `$LOCAL` variable is unset in your terminal.

