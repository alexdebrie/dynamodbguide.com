---
title: "Hierarchical Data"
description: "Walkthrough example of modeling hierarchical data with DynamoDB"
lesson: 2
chapter: 6
date: "01/06/2018"
type: "lesson"
---

In this example, we'll show how to model hierarchical data using DynamoDB. We'll insert a real dataset of 25,000 Starbucks locations into DynamoDB. **You can follow along with some [real example code](https://github.com/alexdebrie/dynamodbguide.com/tree/master/examples/starbucks) from the examples directory in this site's repository.**

Hierarchical data is a common relational data pattern for representing tree-like data structures, such as an organizational structure, a project breakdown list, or even a family tree. In a relational database, it often uses quite a few JOINs to get your answer. Here, we'll see how we can model this data using a single table to enable fast, precise lookups.

> This example is inspired by Rick Houlihan's talk at reInvent 2017. Check here for the [relevant section](https://youtu.be/jzeKPKpucS0?t=36m5s).

## Example background

Imagine we are Starbucks, a multi-national corporation with locations all around the globe. We want to keep our store locations in DynamoDB, and we have five main access patterns:

- Retrieve a single store by its Store Number;
- Gather all stores in a particular country;
- Gather all stores in a particular state or province;
- Gather all stores in a particular city; and
- Gather all stores in a particular zip code.

The first query pattern is straight-forward -- that's a 1:1 relationship using a simple key structure. The next four are more difficult. It could require four different global secondary indexes on each of those distinct attributes. Alternatively, we could make use of [filtering](./filtering) to narrow down to our desired query, but this would consume more read capacity than is necessary.

Instead, we can leverage the hierarchical nature of the location data to answer all four "gather" queries using a single global secondary index 💥 !

Amazingly, there is a Kaggle dataset with [all of the Starbucks locations worldwide](https://www.kaggle.com/starbucks/store-locations) -- over 25,000 locations! This means we can actually load the data into a DynamoDB table and test it for ourselves.

The [examples directory](https://github.com/alexdebrie/dynamodbguide.com/tree/master/examples/starbucks) of the repo includes the code snippets discussed below.

## Before you start

To run this example, you'll need to download the [Starbucks locations dataset](https://www.kaggle.com/starbucks/store-locations) from Kaggle. Unzip it, and move the CSV file into your working directory as `directory.csv`.

You'll also need Python and [Boto3](http://boto3.readthedocs.io/en/latest/index.html), the AWS SDK for Python. You can install boto3 with [pip](https://pip.pypa.io/en/stable/installing/) via `pip install boto3`. If you don't have Python or pip, you'll need to do some Googling to find it.

Finally, some of the examples use [Click](http://click.pocoo.org/5/), which is a Python tool for quickly making CLI interfaces. You can install it with `pip install click`.

## Schema Design & Loading the Table

Once we've downloaded our dataset and installed our requirements, it's time to create and load our table. 

First, let's think of our table structure which means choosing a primary key. A good primary key does at least two things:

- it enables you to uniquely identify each item for writes & updates, and
- it evenly distributes your data across the partition key.

Ideally your primary key will also satisfy at least one of your read access patterns as well.

For us, we'll use the Store Number as a simple primary key. If we were updating a particular store's location information, we would surely know the Store's Number. This would satisfy the first requirement. The Store Number should also distribute data pretty well. Further, it even satisfies our first Read pattern of retrieving a store by its Store Number. This is a pretty good primary key.

We then need to think about our other four read access patterns -- gathering all stores by country, state, city, and zip. We'll discuss this pattern more in the [Gather queries](#gather-queries) section, but for now, we're going to create a [global secondary index](./global-secondary-index) named "StoreLocationIndex" with the following key structure:

- a HASH key of Country, indicating the country where the store is located, and
- a RANGE key named StateCityPostcode that is a string combining the State, City, and Postcode with each element separated by the pound sign (`<STATE>#<CITY>#<POSTCODE>`). For example, a store in Omaha, NE would be stored as `NE#OMAHA#68144`.

To create this table, run the [script to create the table](https://github.com/alexdebrie/dynamodbguide.com/tree/master/examples/starbucks/create_table.py). If it works, you should get a success message:

```bash
$ python create_table.py
Table created successfully!
```

Then, let's load our items into DynamoDB. The [`insert_items.py` script](https://github.com/alexdebrie/dynamodbguide.com/tree/master/examples/starbucks/insert_items.py)  in the example directory opens our CSV file with the Starbucks locations, iterates over the rows, and stores them in our DynamoDB table with the given structure. *Note: this may take a while since there are 25,000 items. It took 2 minutes on my Macbook Pro.*

```bash
$ python insert_items.py
1000 locations written...
2000 locations written...
... <snip> ...
24000 locations written...
25000 locations written...
```

Let's run a quick scan with a COUNT to make sure we've got all of our items:

```bash
$ aws dynamodb scan \
    --table-name StarbucksLocations \
    --select COUNT \
    $LOCAL
```

It should return with 25,599 items:

```bash
{
    "Count": 25599,
    "ScannedCount": 25599,
    "ConsumedCapacity": null
}
```

Let's start querying our data!

## Retrieve Item

Our first query pattern was to "Retrieve a single store by its Store Number." We'll use the Store Number "5860-29255" as an example.

Because our table's primary key is Store Number, we can use the familiar [GetItem](./inserting-retrieving-items#get-item) API call to retrieve a single Item based on its primary key.

Run the [`get_store_location`](https://github.com/alexdebrie/dynamodbguide.com/tree/master/examples/starbucks/get_store_location.py) script provided in the repo. By default, it will use our default Store Number:

It should print out the details for our retrieved Item:

```bash
$ python get_store_location.py
Attempting to retrieve store number 5860-29255...

Store number found! Here's your store:

{'City': {'S': 'Pasadena'},
 'Country': {'S': 'US'},
 'Latitude': {'S': '34.16'},
 'Longitude': {'S': '-118.15'},
 'PhoneNumber': {'S': '626-440-9962'},
 'Postcode': {'S': '911033383'},
 'State': {'S': 'CA'},
 'StateCityPostcode': {'S': 'CA#PASADENA#911033383'},
 'StoreName': {'S': 'Fair Oaks & Orange Grove, Pasadena'},
 'StoreNumber': {'S': '5860-29255'},
 'StreetAddress': {'S': '671 N. Fair Oaks Avenue'}}
```

Nice! Notice that it matches our requested StoreNumber. This will satisfy our first access pattern.

If you want to use the script to retrieve other stores, just pass a `--store-number` option:

```bash
$ python get_store_location.py --store-number 3513-125945
Attempting to retrieve store number 3513-125945...

Store number found! Here's your store:

{'City': {'S': 'Anchorage'},
 'Country': {'S': 'US'},
 'Latitude': {'S': '61.21'},
 'Longitude': {'S': '-149.78'},
 'PhoneNumber': {'S': '907-339-0900'},
 'Postcode': {'S': '995042300'},
 'State': {'S': 'AK'},
 'StateCityPostcode': {'S': 'AK#ANCHORAGE#995042300'},
 'StoreName': {'S': 'Safeway-Anchorage #1809'},
 'StoreNumber': {'S': '3513-125945'},
 'StreetAddress': {'S': '5600 Debarr Rd Ste 9'}}
```

## Gather queries

Time to move onto the fun part. We have four additional queries we want to use, and we're going to handle it with a single global secondary index.

The hierarchical structure of the data is important here. Stores in the same State are in the same Country, stores in the same City are in the same State, and stores in the same Postcode are in the same City, (ssh, [apparently that's not exactly true](https://github.com/Ziptastic/ziptastic-jquery-plugin/issues/2)).

Because of this hierarchical structure, we can use our computed SORT key plus the `begins_with()` function to find all stores at a particular level.

Let's use an example. Think of two different Starbucks stores - our Pasadena example from the previous section, plus a store in San Francisco.

Our StateCityPostcode RANGE key for the first store is `CA#PASADENA#911033383`. The StateCityPostcode for the second store is `CA#SAN FRANCISCO#94158`. Notice how they both start with "CA", and then add their city and post codes.

If I wanted to query for _all_ California stores, I would make a [key expression](./querying#using-key-expressions) that looks like this:

```
Country = "US" AND begins_with(StateCityPostcode, "CA")
```

_Note: This is simplified, as I would actually need to use [expression attribute values](./expression-basics#expression-attribute-values) to represent "US" and "CA"._

What if I want to get even more specific and query all stores _in San Francisco_? Now my key expression looks like:

```
Country = "US" AND begins_with(StateCityPostcode, "CA#SAN FRANCISCO")
```

Finally, I could get all the way to the post code level by using:

```
Country = "US" AND begins_with(StateCityPostcode, "CA#SAN FRANCISCO#94158")
```

You can see this in action by using the [`query_store_locations.py`](https://github.com/alexdebrie/dynamodbguide.com/tree/master/examples/starbucks/query_store_locations.py) in the example repo.

First, let's query all of the stores in the US. I'm using the `--count` flag to only return the count of stores, rather than the full item to avoid trashing my terminal:

```bash
$ python query_store_locations.py --country 'US' --count
Querying locations in country US.
No statecitypostcode specified. Retrieving all results in Country.

Retrieved 4648 locations.
```

Note that it says "No statecitypostcode specified", so it returned the results for the US. This was 4,648 locations. Americans love their Starbucks.

Let's narrow it down to a state level. We'll try the same query for all Nebraska Starbucks:

```bash
$ python query_store_locations.py --country 'US' --state 'NE' --count
Querying locations in country US, state NE.
The key expression includes a begins_with() function with input of 'NE'

Retrieved 58 locations.
```

In this one, it shows us that we did use a key expression with a `begins_with()` function that used "NE". It returned 58 locations.

We can go another level by specifying the city of Omaha:

```bash
$ python query_store_locations.py --country 'US' --state 'NE' --city 'Omaha' --count
Querying locations in country US, state NE, city Omaha.
The key expression includes a begins_with() function with input of 'NE#OMAHA'

Retrieved 30 locations.
```

Now our key expression uses `NE#OMAHA` to check the start of the SORT key, and we're down to 30 locations.

Finally, let's check it at a post code level. Since this has fewer results, I'll remove the `--count` flag so we can see the full Items:

```bash
$ python query_store_locations.py --country 'US' --state 'NE' --city 'Omaha' --postcode '68144'
Querying locations in country US, state NE, city Omaha, postcode 68144.
The key expression includes a begins_with() function with input of 'NE#OMAHA#68144'

{'Count': 2,
 'Items': [{'City': {'S': 'OMAHA'},
            'Country': {'S': 'US'},
            'Latitude': {'S': '41.23'},
            'Longitude': {'S': '-96.14'},
            'PhoneNumber': {'S': '402-334-1415'},
            'Postcode': {'S': '68144'},
            'State': {'S': 'NE'},
            'StateCityPostcode': {'S': 'NE#OMAHA#68144'},
            'StoreName': {'S': 'Family Fare 3784 Omaha'},
            'StoreNumber': {'S': '48135-261124'},
            'StreetAddress': {'S': '14444 W. CENTER RD., Westwood Plaza'}},
           {'City': {'S': 'Omaha'},
            'Country': {'S': 'US'},
            'Latitude': {'S': '41.23'},
            'Longitude': {'S': '-96.1'},
            'PhoneNumber': {'S': '4027785900'},
            'Postcode': {'S': '681443957'},
            'State': {'S': 'NE'},
            'StateCityPostcode': {'S': 'NE#OMAHA#681443957'},
            'StoreName': {'S': '125th & W. Center Rd.'},
            'StoreNumber': {'S': '2651-53179'},
            'StreetAddress': {'S': '12245 West Center Rd.'}}],
 'ResponseMetadata': {'HTTPHeaders': {'content-length': '738',
                                      'content-type': 'application/x-amz-json-1.0',
                                      'server': 'Jetty(8.1.12.v20130726)',
                                      'x-amz-crc32': '2237738683',
                                      'x-amzn-requestid': '5acf463b-6341-45b7-a485-dd2860845d97'},
                      'HTTPStatusCode': 200,
                      'RequestId': '5acf463b-6341-45b7-a485-dd2860845d97',
                      'RetryAttempts': 0},
 'ScannedCount': 2}
```

Our key expression used `NE#OMAHA#68144`, and we narrowed it down to 2 results. It returned the full items, which is likely what we would use in our application if we were making this query.

Go ahead and play around with the `query_store_locations.py` script using your own locations. If you want help on the available commands, use the `--help` flag:

```bash
$ python query_store_locations.py --help
Usage: query_store_locations.py [OPTIONS]

Options:
  --country TEXT      Country for stores to query. Default is 'US'.
  --state TEXT        State abbreviation for stores to query. E.g.: 'NE'
  --city TEXT         City for stores to query. E.g.: 'Omaha'
  --postcode TEXT     Post code for stores to query. E.g.: '68144'
  --default-state     Use defaults to query at state level.
  --default-city      Use defaults to query at city level.
  --default-postcode  Use defaults to query at post code level.
  --count             Only show counts of items.
  --help              Show this message and exit.
```

> Is anything in this example unclear? [Hit me up](mailto:alexdebrie1@gmail.com) and let me know!
