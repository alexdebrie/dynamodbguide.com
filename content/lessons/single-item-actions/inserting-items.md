---
title: "Inserting & Retrieving Items"
description: "Learn how to create a table, insert items, and retrieve items with AWS DynamoDB."
lesson: 2
chapter: 2
date: "1/1/2018"
type: "lesson"
---

[Items](./anatomy-of-an-item) are the key building block in DynamoDB. In this lesson, we're going to learn the basics of inserting and retrieving items with DynamoDB. We'll create a Users table with a [simple primary key](./anatomy-of-an-item#primary-keys) of Username. Then, we'll explore two basic API calls: [PutItem](#put-item) and [GetItem](#get-item).

This lesson will only cover the basics of using these API calls. The next lesson will explain [using expressions](./expression-basics) in these API calls for advanced functionality. Then we'll move on to [updating and deleting items](./updating-deleting-items) in the following lesson.

> _To follow along with the examples in this lesson, make sure you have your [environment set up](./environment-setup) properly. Note that I'm appending a `$LOCAL` variable to the end of every command to [facilitate those using DynamoDB Local](./environment-setup#the-local-variable)._

## Creating a table

The first step is to create our table that we'll use throughout this example. We want to create a table to hold Users that will use a simple primary key of "Username", which is a string.

When creating a table, you will need to provide AttributeDefinitions for each attribute you need to define. An attribute definition includes the name and [type](./anatomy-of-an-item#attribute-types) of the attribute. For us, this means we have an attribute with the name "Username" and of type "S", for String. You only need to define attributes which are used in your [primary key](./anatomy-of-an-item#primary-keys) or are used in secondary indexes.

You'll then need to provide the KeySchema of your table. This is where you define your primary key, including a HASH key and an optional RANGE key. In this example, we're using a simple primary key so we're just using Username as a HASH key.

Finally, you'll need to specify a TableName and the [ProvisionedThroughput](./key-concepts#read-and-write-capacity) for your table. We'll keep the Read and Write Capacity Units at 1 since this is just an example.

With these notes in mind, let's create our table:

```bash
$ aws dynamodb create-table \
  --table-name UsersTable \
  --attribute-definitions '[
    {
        "AttributeName": "Username",
        "AttributeType": "S"
    }
  ]' \
  --key-schema '[
    {
        "AttributeName": "Username",
        "KeyType": "HASH"
    }
  ]' \
  --provisioned-throughput '{
    "ReadCapacityUnits": 1,
    "WriteCapacityUnits": 1
  }' \
  $LOCAL
```

If your operation was successful, you should get a response with your table details:

```
{
    "TableDescription": {
        "TableArn": "arn:aws:dynamodb:ddblocal:000000000000:table/UsersTable",
        "AttributeDefinitions": [
            {
                "AttributeName": "Username",
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
        "TableName": "UsersTable",
        "TableStatus": "ACTIVE",
        "KeySchema": [
            {
                "KeyType": "HASH",
                "AttributeName": "Username"
            }
        ],
        "ItemCount": 0,
        "CreationDateTime": 1514562957.925
    }
}
```

Awesome! You have a table. You can view your tables with the `list-tables` command:

```bash
$ aws dynamodb list-tables $LOCAL
{
    "TableNames": [
        "UsersTable"
    ]
}
```

You can see details of your table with the `describe-table` command:

```bash
$ aws dynamodb describe-table \
  --table-name UsersTable \
  $LOCAL
```

## Put Item

Now that we have a table, let's throw some data into it. We'll be using the PutItem API call to DynamoDB.

With the PutItem call, you provide an entire Item to be placed into your DynamoDB table. This action will create a new Item if no Item with the given primary key exists, or it will _overwrite an existing Item_ if an Item with that primary key already exists.

> If you would like to prevent overwriting an existing Item, you'll need to use [condition expressions](./expression-basics#condition-expressions). If you only want to update portions of an existing Item rather than overwriting the entire Item, you'll need to use the [UpdateItem](./updating-deleting-items#updating-items) API call.

Let's insert a simple Item into our table. Recall that you only need to provide the attributes of the table's primary key. Our primary key is a "Username" field. We'll create a User with the Username of "alexdebrie":

```bash
$ aws dynamodb put-item \
    --table-name UsersTable \
    --item '{
      "Username": {"S": "alexdebrie"}
    }' \
    $LOCAL
```

If no error was returned, your write was successful!

Let's add one more item to our table before moving on (don't worry - we'll read our items back soon enough!). Usually we want to include more information than just what's required by our primary key. Let's add a second User that also has Name and Age attributes:

```bash
$ aws dynamodb put-item \
    --table-name UsersTable \
    --item '{
      "Username": {"S": "daffyduck"},
      "Name": {"S": "Daffy Duck"},
      "Age": {"N": "81"}
    }' \
    $LOCAL
```

Note that we've still included our "Username" attribute as it's required by our table. We've also added Name and Age attributes, each with the proper [attribute types](./anatomy-of-an-item#attribute-types). Unlike a relational database, we didn't need to define these additional attributes up front. We can add them freely as needed. 

DynamoDB's flexibility can be a blessing and a curse. The flexibility allows for a more dynamic data model that may fit your requirements. However, it won't provide the useful guardrails that a relational database includes to assist with data integrity.

## Get Item

In the previous section, we inserted two Items into our Users Table. Now let's see how we can retrieve those items for use in our application.

Retrieving Items is done with the GetItem API call. This call requires the table name and the primary key of the Item you want to retrieve. Remember: _each Item is uniquely identifiable by its primary key_. Thus, the GetItem call is a way to get exactly the item you want.

Let's retrieve our first User:

```bash
$ aws dynamodb get-item \
    --table-name UsersTable \
    --key '{
      "Username": {"S": "alexdebrie"}
    }' \
    $LOCAL

{
    "Item": {
        "Username": {
            "S": "alexdebrie"
        }
    }
}
```

Notice that the command returned the Item requested in an "Item" key.

If we try to request our second User, we'll get the full Item with its additional Name and Age attributes:

```bash
$ aws dynamodb get-item \
    --table-name UsersTable \
    --key '{
      "Username": {"S": "daffyduck"}
    }' \
    $LOCAL

{
    "Item": {
        "Username": {
            "S": "daffyduck"
        },
        "Age": {
            "N": "81"
        },
        "Name": {
            "S": "Daffy Duck"
        }
    }
}
```

Sometimes you may want to retrieve only certain attributes when getting an Item. This can be particularly helpful for saving network bandwidth when working with large items.

Use the `--projection-expression` option to return only particular elements from an item:

```bash
$ aws dynamodb get-item \
    --table-name UsersTable \
    --projection-expression "Age, Username" \
    --key '{
      "Username": {"S": "daffyduck"}
    }' \
    $LOCAL

{
    "Item": {
        "Username": {
            "S": "daffyduck"
        },
        "Age": {
            "N": "81"
        }
    }
}
```

In the example above, we used the `--projection-expression` option to retrieve only the Age and Username of Daffy Duck. You can even use projection expressions to grab particular nested elements in a [List attribute](./anatomy-of-an-item#list-type) or [Map attribute](./anatomy-of-an-item#map-type).

This lesson has covered the basics of inserting and retrieving items with DynamoDB. In the [next lesson](./expression-basics), we'll look at advanced functionality using expressions.
