---
title: "Expression Basics"
description: "Learn how to use expressions with AWS DynamoDB."
lesson: 3
chapter: 2
date: "12/17/2017"
type: "lesson"
---

In this lesson, we will cover using expressions with DynamoDB. Expressions are an integral part of using DynamoDB, and they are used in a few different areas:

- **[Condition expressions](#condition-expressions)** are used when manipulating individual items to only change an item when certain conditions are true. 
- **Projection expressions** are used to specify a subset of attributes you want to receive when reading Items. We used these in our GetItem calls in the previous lesson.
- **[Update expressions](./updating-deleting-items#updating-items)** are used to update a particular attribute in an existing Item.
- [**Key condition expressions**](./querying#using-key-expressions) are used when querying a table with a composite primary key to limit the items selected. 
- [**Filter expressions**](./filtering) allow you to filter the results of queries and scans to allow for more efficient responses.

Understanding these expressions is key to getting the full value from DynamoDB. In this section, we'll look at the basics of expressions, including the use of expression attributes names and values. Then, we'll see how to use condition expressions in the context of our [PutItem](./inserting-retrieving-items#put-item) calls from the previous lesson.

## Basics of Expressions

Expressions are strings that use DynamoDB's domain-specific expression logic to check for the validity of a described statement. With expressions, you can use comparator symbols, such as "=" (equals), ">" (greater than), or ">=" (greater than or equal to). 

For example, a comparator symbol could be used as follows:

```
"Age >= 21"
```

to ensure that the Item being manipulated has an Age greater than or equal to 21.

> Note: this example wouldn't work as it wouldn't know the type of the value "21". You would need to use the [expression attribute values](#expression-attribute-values) discussed below.

In addition to comparators, you can also use certain functions in your expressions. This includes checking whether a particular attribute exists (`attribute_exists()` function) or does not exist (`attribute_not_exists()` function), or that an attribute begins with a particular substring (`begins_with()` function).

For example, you could use the `attribute_not_exists()` function as follows to ensure you're not manipulating an Order that already has a DateShipped attribute:

```
"attribute_not_exists(DateShipped)"
```

The full list of available functions is:

- `attribute_exists()`: Check for existence of an attribute;
- `attribute_not_exists()`: Check for non-existence of an attribute;
- `attribute_type()`: Check if an attribute is of a certain type;
- `begins_with()`: Check if an attribute begins with a particular substring;
- `contains()`: Check if a String attribute contains a particular substring _or_ a Set attribute contains a particular element; and
- `size()`: Returns a number indicating the size of an attribute.

## Expression Placeholders

From the previous section, we learned that expressions are strings that check for the validity of a particular statement. However, there are times when you cannot accurately represent your desired statement due to DynamoDB syntax limitations or when it's easier to use variable substitution to create your statement rather than building a string.

DynamoDB's expression language lets you use **expression attribute names** and **expression attribute values** to get around these limitations. These allow you to define expression variables outside of the expression string itself, then use replacement syntax to use these variables in your expression.

#### Expression Attribute Names

Let's start with understanding expression attribute names. There are times when you want to write an expression for a particular attribute, but you can't properly represent that attribute name due to DynamoDB limitations. This could be because:

- **Your attribute is a reserved word.** DynamoDB has a [huge list of reserved words](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html), including words like "Date", "Year", and "Name". If you want to use those as attribute names, you'll need to use expression attribute name placeholders.
- **Your attribute name contains a dot.** DynamoDB uses dot syntax to access nested items in a document. If you used a dot in your top-level attribute name, you'll need to use a placeholder.
- **Your attribute name begins with a number.** DynamoDB won't let you use attribute names that begin with a number in your expression syntax.

To use expression attribute names, you pass in a map where the key is the placeholder to use in your expression and the value is the attribute name you want to expand to. For example, if I wanted to use a placeholder of "#a" for my attribute name of "Age", my expression attribute names map would look like:

```
  --expression-attribute-names '{
    "#a": "Age"
  }'
```

Then, I could use "#a" in my expression when I wanted to refer to the Age attribute.

> When using expression attribute names, the placeholder must begin with a pound sign ("#").

In the ["GetItem" example](./inserting-retrieving-items#get-item) from the previous lesson, we used the `--projection-expression` flag to return a subset of the item attributes. To alter it to use expression attribute names, the API call would look like:

```bash
$ aws dynamodb get-item \
    --table-name UsersTable \
    --projection-expression "#a, #u" \
    --expression-attribute-names '{
      "#a": "Age",
      "#u": "Username"
    }' \
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

Notice that we've replaced the "Age" and "Username" attributes with the expression attribute names of "#a" and "#u", respectively.

One final note: if you're modifying a nested attribute in a [map](./anatomy-of-an-item#map-type), you'll need to use expression attribute names for _each_ element in the attribute name.

For example, imagine you had an "Address" map attribute with keys of "Street", "City", and "State". You have a use case where you want to check if the "State" is equal to a particular value. To get the nested "Address.State" attribute, you would need to write it as:

```
    --condition-expression "#a.#st = 'Nebraska' " \
    --expression-attribute-names '{
      "#a": "Address",
      "#st": "State"
    }'

```

Notice that both Address and State have been replaced with expression attribute names.

#### Expression Attribute Values

Expression attribute values are similar to expression attribute names except that they are used for the _values_ used to compare to values of attributes on an Item, rather than the name of the attribute.

The syntax for expression attribute values is the same as expression attribute names with two changes:

- expression attribute values must start with a colon (":") rather than a pound sign; and
- expression attribute values must specify the type for the value they are referencing, e.g.: `{":agelimit": {"N": 21} }`

For examples of using expression attribute values, look at the [next lesson](./updating-deleting-items#using-the-set-update-clause) where we use Update Expressions.

## Condition Expressions

Let's close out this lesson by using an expression on one of our previous examples.

Recall in the last lesson that we used the [PutItem](./inserting-retrieving-items#put-item) operation to insert Items into our table. The PutItem call overwrites any existing Item with the provided primary key. 

This can be a destructive operation. With our Users example, imagine a new user tries to use a Username which has already been claimed by another user. If we did a simple PutItem operation, it would overwrite the existing User with that Username -- not a great experience!

We can use a condition expression to ensure there isn't a User with the requested Username before creating the new Item. We would adjust our call to look as follows:

```bash
$ aws dynamodb put-item \
    --table-name UsersTable \
    --item '{
      "Username": {"S": "yosemitesam"},
      "Name": {"S": "Yosemite Sam"},
      "Age": {"N": "73"}
    }' \
    --condition-expression "attribute_not_exists(#u)" \
    --expression-attribute-names '{
      "#u": "Username"
    }' \
    $LOCAL
```

Note that we've added a condition expression using the `attribute_not_exists()` function on the primary key of the table.

On first run, this Item is inserted successfully. If you try inserting the same Item again, you'll get an error:

```bash
An error occurred (ConditionalCheckFailedException) when calling the PutItem operation: The conditional request failed
```

The operation failed because the Username was already taken. We can return an error to the user and ask them to choose a different Username.

In the next lesson, we'll cover [updating and deleting items](./updating-deleting-items), which will include a look at some additional expression examples.
