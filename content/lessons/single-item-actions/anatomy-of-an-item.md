---
title: "Anatomy of an Item"
description: "Learn basics of DynamoDB items, including primary keys, attributes, and attribute types."
lesson: 1
chapter: 2
date: "1/1/2018"
type: "lesson"
---

An _item_ is the core unit of data in DynamoDB. It is comparable to a row in a relational database, a document in MongoDB, or a simple object in a programming language. Each item is _uniquely identifiable_ by a primary key that is set on a table level.

An item is composed of _attributes_, which are bits of data on the item. This could be the "Name" for a User, or the "Year" for a Car. Attributes have types -- e.g., strings, numbers, lists, sets, etc -- which must be provided when writing and querying Items.

In this section, we'll cover the core aspects of Items, including:

- [Primary keys](#primary-keys),
- [Attributes](#attributes), and
- [Attribute types](#attribute-types).

## Primary Keys

> **_Every item in a table is uniquely identified by its primary key._**

When creating a new table, you will need to specify the primary key of that table. Every item in a table is uniquely identified by its primary key. Accordingly, the primary key must be included with every item that is written to a DynamoDB table.

There are two types of primary keys. A **simple primary key** uses a single attribute to identify an item, such as a Username or an OrderId. Using a DynamoDB table with a simple primary key is similar to using most simple key-value stores, such as Memcached.

A **composite primary key** uses a combination of two attributes to identify a particular item. The first attribute is a _partition key_ (also known as a "hash key") which is used to segment and distribute items across shards. The second attribute is a _sort key_ (also known as a "range key") which is used to order items with the same partition key. A DynamoDB table with a composite primary key can use interesting query patterns beyond simple get / set operations.

Understanding the primary key is a crucial part of planning your data model for a DynamoDB table. The primary key will be your main method of inserting and updating items in your table.

## Attributes

An item is made up of _attributes_, which are different elements of data on a particular item. For example, an item in the User table might have a Name attribute, an Age attribute, an Address attribute, and more. They are comparable to columns in a relational database.

Most attributes in a DynamoDB table are _not_ required for every item. DynamoDB is a NoSQL database which allows for a more flexible data model than the standard relational databases. You could store entirely different kinds of objects in a single DynamoDB table, such as a Car object with Make, Model, and Year attributes, and a Pet object with Type, Breed, Age, and Color attributes. This is a common practice, as you will often have multiple different entity types in a single table.

There is one exception to the flexible model of DynamoDB items -- each item **must** have the attribute(s) for the defined [primary key](#primary-keys) of the table.

## Attribute types

When setting an attribute for a DynamoDB item, you must specify the type of the attribute. Available types include simple types like strings and numbers as well as composite types like lists, maps, or sets.

When manipulating an item, you'll provide each attribute you're trying to set with the type of the attribute. This will be provided in a map where the keys are the names of the attributes to set. The values for each attribute is a map with a single key indicating the type of value for the attribute and the value being the actual value of the attribute.

For example, if you want to store a User object with three attributes of Name, Age, and Roles, your API call to store the User would look like:

```
{
    "Name": { "S": "Alex DeBrie" },
    "Age": { "N": "29" },
    "Roles": { "L": [{ "S": "Admin" }, { "S": "User" }] }
}
```

In this example, we've stored a _string_ attribute of "Name" with the value "Alex DeBrie" using the string indicator of "S". There's also a _number_ attribute of "Age" with the value "29" with the number indicator of "N". Finally, there's a _list_ attribute of "Roles" with the value containing two items, "Admin" and "User" using the list indicator of "L".

Similarly, when you retrieve an item from DynamoDB, it will return the attributes in a map with the attribute names as the keys of the map. The values of the map will be a map containing a single key indicating the type of the attribute and the value containing the actual value of the attribute.

For example, if you're using the GetItem API call to retrieve the User from above, your response would look like:

```
{
    "Item": {
        "Name": {
            "S": "Alex DeBrie"
        },
        "Age": {
            "N": "29"
        },
        "Roles": {
            "L": [{ "S": "Admin" }, { "S": "User" }]
        }
    }
}
```

> Note that the value for the Age attribute is a string -- "29" -- rather than the actual number 29. In your application, you'll need to do conversions from a string type to a number type if needed.

With the basics of attribute types in mind, let's look at the different types of attributes. Each type starts with the identifier used (e.g. `S` for strings, `N` for numbers, etc) as well as an example usage.

#### String type

**Identifier:** "S"

**Example Usage:**

```
"Name": { "S": "Alex DeBrie" }
```

The string type is the most basic data type, representing a Unicode string with UTF-8 encoding.

DynamoDB allows sorting and comparisons of string types according to the UTF-8 encoding. This can be helpful when sorting last names ("Give me all last names, sorted alphabetically") or when filtering ISO timestamps ("Give me all orders between "2017-07-01" and "2018-01-01").

#### Number type

**Identifier:** "N"

**Example Usage:**

```
"Age": { "N": "29" }
```

The number type represents positive and negative numbers, or zero. It can be used for precision up to 38 digits.

Note that you will send your number up as a string value. However, you may do numerical operations on your number attributes when working with [condition expressions](./expression-basics#condition-expressions).

#### Binary type

**Identifier:** "B"

**Example Usage:**

```
"SecretMessage": { "B": "bXkgc3VwZXIgc2VjcmV0IHRleHQh" }
```

You can use DynamoDB to store Binary data directly, such as an image or compressed data. Generally, larger binary blobs should be stored in something like Amazon S3 rather than DynamoDB to enable greater throughput, but you may use DynamoDB if you like.

When using Binary data types, you must base64 encode your data before sending to DynamoDB.

#### Boolean type

**Identifier:** "BOOL"

**Example Usage:**

```
"IsActive": { "BOOL": "false" }
```

The Boolean type stores either "true" or "false".

#### Null type

**Identifier:** "NULL"

**Example Usage:**

```
"OrderId": { "NULL": "true" }
```

The Null type stores a boolean value of either "true" or "false". I would generally recommend against using it.

#### List type

**Identifier:** "L"

**Example Usage:**

```
"Roles": { "L": [ "Admin", "User" ] }
```

The List type allows you to store a collection of values in a single attribute. The values are ordered and do not have to be of the same type (e.g. string or number).

You can operate directly on list elements using [expressions](./expression-basics).

#### Map type

**Identifier:** "M"

**Example Usage:**

```
"FamilyMembers": {
    "M": {
        "Bill Murray": {
            "Relationship": "Spouse",
            "Age": 65
        },
        "Tina Turner": {
            "Relationship": "Daughter",
            "Age": 78,
            "Occupation": "Singer"
        }
    }
}
```

Like the List type, the Map type allows you to store a collection of values in a single attribute. For a Map attribute, these values are stored in key-value pairs, similar to the map or dictionary objects in most programming languages.

Also like the List type, you can operate directly on map elements using [expressions](./expression-basics).

#### String Set type

**Identifier:** "SS"

**Example Usage:**

```
"Roles": { "SS": [ "Admin", "User" ] }
```

DynamoDB includes three different Set types which allow you to maintain a collection of _unique_ items of the same type. The String Set is used to hold a set of strings.

Sets can be particularly useful with [expressions](./expression-basics). You can run update commands to add & remove elements to a set without fetching & inserting the whole object. You may also check for the existence of an element within a set when updating or retrieving items.

#### Number Set type

**Identifier:** "NS"

**Example Usage:**

```
"RelatedUsers": { "NS": [ "123", "456", "789" ] }
```

DynamoDB includes three different Set types which allow you to maintain a collection of _unique_ items of the same type. The Number Set is used to hold a set of numbers.

Sets can be particularly useful with [expressions](./expression-basics). You can run update commands to add & remove elements to a set without fetching & inserting the whole object. You may also check for the existence of an element within a set when updating or retrieving items.

#### Binary Set type

**Identifier:** "BS"

**Example Usage:**

```
"SecretCodes": { "BS": [ 
	"c2VjcmV0IG1lc3NhZ2UgMQ==", 
	"YW5vdGhlciBzZWNyZXQ=", 
	"dGhpcmQgc2VjcmV0" 
] }
```

DynamoDB includes three different Set types which allow you to maintain a collection of _unique_ items of the same type. The Binary Set is used to hold a set of binary values.

Sets can be particularly useful with [expressions](./expression-basics). You can run update commands to add & remove elements to a set without fetching & inserting the whole object. You may also check for the existence of an element within a set when updating or retrieving items.

With the basics of Items in mind, let's [insert and retrieve our first items](./inserting-retrieving-items).
