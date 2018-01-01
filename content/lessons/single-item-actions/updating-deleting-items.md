---
title: "Updating & Deleting Items"
description: "Learn how to update and delete Items with AWS DynamoDB"
lesson: 4
chapter: 2
date: "12/17/2017"
type: "lesson"
---

In this lesson, we'll learn about updating and deleting Items. This is the final lesson on Single-Item Actions. The next chapter is on Multi-Item Actions where we'll use Queries & Scans to operate on multiple Items at a time.

## Updating Items

Previously, we used the [PutItem operation](./inserting-retrieving-items#put-item) to insert Items into our DynamoDB table. We saw that this operation completely overwrites any existing Item in the table. To counteract this, we used a [condition expression](./expression-basics#condition-expressions) to only insert the Item if an Item with that primary key did not exist previously.

At other times, it is useful to _update_ an existing Item by modifying one or two attributes but leaving the other attributes unchanged. DynamoDB has an UpdateItem operation which allows you to update an Item directly without first retrieving the Item, manipulating it as desired, then saving it back with a PutItem operation.

When using the UpdateItem action, you need to specify an **update expression**. This describes the update actions you want to take and uses the [expression syntax](./expression-basics).

When using the update expression, you must include one of four update clauses. These clauses are:

- **SET:** Used to add an attribute to an Item or modify an existing attribute;
- **REMOVE:** Used to delete attributes from an Item.
- **ADD:** Used to increment/decrement a [Number](./anatomy-of-an-item#number-type) or insert elements into a [Set](./anatomy-of-an-item#string-set-type).
- **DELETE:** Used to remove items from a [Set](./anatomy-of-an-item#string-set-type).

Let's check a few of these by example.

#### Using the SET update clause

The most common update clause is "SET", which is used to add an attribute to an Item if the attribute does not exist or to overwrite the existing attribute value if it does exist.

Returning to our initial PutItem examples, perhaps we want to have a DateOfBirth attribute for our Users. Without the UpdateItem action, we would need to retrieve the Item with a GetItem call and then reinsert the Item with a DateOfBirth attribute via a PutItem call. With the UpdateItem call, we can just insert the DateOfBirth directly:

```bash
$ aws dynamodb update-item \
    --table-name UsersTable \
    --key '{
      "Username": {"S": "daffyduck"}
    }' \
    --update-expression 'SET #dob = :dob' \
    --expression-attribute-names '{
      "#dob": "DateOfBirth"
    }' \
    --expression-attribute-values '{
      ":dob": {"S": "1937-04-17"}
    }' \
    $LOCAL
```

Note that we used the [expression attribute names](./expression-basics#expression-attribute-names) and [expression attribute values](./expression-basics#expression-attribute-values) from the previous lesson.

If we then retrieve our Item, we can see that the DateOfBirth attribute has been added but our previous attributes are still there:

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
        "DateOfBirth": {
            "S": "1937-04-17"
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

#### Using the REMOVE update clause

The REMOVE clause is the opposite of the SET clause -- it deletes an attribute from an Item if it exists.

Let's use it here to remove the "DateOfBirth" attribute we just added. We're also going to add a `--return-values` option to have DynamoDB return the Item to us after the update so we don't have to make a separate GetItem call. The `--return-values` option has different options, including to return the old Item before the changes or to return only the updated attributes before they were changed. Here, we'll just use the "ALL_NEW" option to show the Item as it exists after the operation:

```bash
$ aws dynamodb update-item \
    --table-name UsersTable \
    --key '{
      "Username": {"S": "daffyduck"}
    }' \
    --update-expression 'REMOVE #dob' \
    --expression-attribute-names '{
      "#dob": "DateOfBirth"
    }' \
    --return-values 'ALL_NEW' \
    $LOCAL

{
    "Attributes": {
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

We can see that our Item no longer contains a DateOfBirth attribute.

## Deleting Items

The final single-item action to cover is DeleteItem. There will be times when you want to delete Items from your tables, and this is the action you'll use.

The DeleteItem action is pretty simple -- just provide the key of the Item you'd like to delete:

```bash
$ aws dynamodb delete-item \
    --table-name UsersTable \
    --key '{
      "Username": {"S": "daffyduck"}
    }' \
    $LOCAL
```

Your Item is deleted! If you try to retrieve your Item with a GetItem, you'll get an empty response.

Similar to the PutItem call, you can add a `--condition-expression` to only delete your Item under certain conditions. Let's say we want to delete Yosemite Sam, but only if he's younger than 21 years old:

```bash
$ aws dynamodb delete-item \
    --table-name UsersTable \
    --key '{
      "Username": {"S": "yosemitesam"}
    }' \
    --condition-expression "Age < :a" \
    --expression-attribute-values '{
      ":a": {"N": "21"}
    }' \
    $LOCAL

An error occurred (ConditionalCheckFailedException) when calling the DeleteItem operation: The conditional request failed
```

Because Yosemite Sam is 73 years old, the conditional check failed and the delete did not go through.

## Conclusion

This concludes the single-item actions chapter of the DynamoDB guide. We learned about the basics of Items, including primary keys, attributes, and attribute types. We then covered inserting and retrieving Items. Then we looked at expression syntax, including expression attribute names and values. We did some conditional expressions, and wrapped up with update and delete actions.

The next chapter covers actions that [operate on multiple items](./working-with-multiple-items). This includes [queries](./querying) and [scans](./scans), as well as how to use [filter expressions](./filtering). These actions take advantage of tables with composite primary keys and increase the utility of DynamoDB.
