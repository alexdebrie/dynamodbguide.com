import boto3

client = boto3.client('dynamodb', endpoint_url='http://localhost:8000')

try:
    resp = client.create_table(
        AttributeDefinitions=[
            {
                "AttributeName": "Country",
                "AttributeType": "S"
            },
            {
                "AttributeName": "StateCityPostcode",
                "AttributeType": "S"
            },
            {
                "AttributeName": "StoreNumber",
                "AttributeType": "S"
            }
        ],
        TableName="StarbucksLocations",
        KeySchema=[
            {
                "AttributeName": "StoreNumber",
                "KeyType": "HASH"
            }
        ],
        GlobalSecondaryIndexes=[
            {
                "IndexName": "StoreLocationIndex",
                "KeySchema": [
                    {
                        "AttributeName": "Country",
                        "KeyType": "HASH"
                    },
                    {
                        "AttributeName": "StateCityPostcode",
                        "KeyType": "RANGE"
                    }
                ],
                "Projection": {
                    "ProjectionType": "ALL"
                },
                "ProvisionedThroughput": {
                    "ReadCapacityUnits": 1,
                    "WriteCapacityUnits": 1
                }
            },
        ],
        ProvisionedThroughput={
            "ReadCapacityUnits": 1,
            "WriteCapacityUnits": 1
        }
    )
    print("Table created successfully!")
except Exception as e:
    print("Error creating table:")
    print(e)
