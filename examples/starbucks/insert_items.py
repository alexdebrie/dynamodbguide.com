import codecs
import csv

import boto3

client = boto3.client('dynamodb', endpoint_url='http://localhost:8000')

def write_item(row):
    range_key = "{state}#{city}#{postcode}".format(
        state=row['State/Province'].upper(),
        city=row['City'].upper(),
        postcode=row['Postcode'].upper()
    )
    client.put_item(
        TableName="StarbucksLocations",
        Item={
            "Country": {"S": row.get('Country') or 'NULL' },
            "State": {"S": row.get('State/Province') or 'NULL' },
            "City": {"S": row.get('City') or 'NULL' },
            "Postcode": {"S": row.get('Postcode') or 'NULL' },
            "StateCityPostcode": {"S": range_key },
            "StoreNumber": {"S": row.get('Store Number') or 'NULL' },
            "StoreName": {"S": row.get('Store Name') or 'NULL' },
            "StreetAddress": {"S": row.get('Street Address') or 'NULL' },
            "Latitude": {"S": row.get('Latitude') or 'NULL' },
            "Longitude": {"S": row.get('Longitude') or 'NULL' },
            "PhoneNumber": {"S": row.get('Phone Number') or 'NULL' },
        },
    )


if __name__ == "__main__":
    count = 0
    with codecs.open('directory.csv', 'r', encoding='utf8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            write_item(row)
            count += 1
            if count % 1000 == 0:
                print("{} locations written...".format(count))
