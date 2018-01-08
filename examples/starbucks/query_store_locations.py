import pprint

import boto3
import click

client = boto3.client('dynamodb', endpoint_url='http://localhost:8000')
DEFAULT_COUNTRY="US"
DEFAULT_STATE="NE"
DEFAULT_CITY="OMAHA"
DEFAULT_POSTCODE="68144"

@click.command()
@click.option('--country', default=DEFAULT_COUNTRY, help="Country for stores to query. Default is 'US'.", type=str)
@click.option('--state', help="State abbreviation for stores to query. E.g.: 'NE'", type=str)
@click.option('--city', help="City for stores to query. E.g.: 'Omaha'", type=str)
@click.option('--postcode', help="Post code for stores to query. E.g.: '68144'", type=str)
@click.option('--default-state', help="Use defaults to query at state level.", is_flag=True)
@click.option('--default-city', help="Use defaults to query at city level.", is_flag=True)
@click.option('--default-postcode', help="Use defaults to query at post code level.", is_flag=True)
@click.option('--count', help="Only show counts of items.", is_flag=True)
def query_store_locations(country, state, city, postcode, default_state, default_city, default_postcode, count):
    info_message = "Querying locations in country {}".format(country)
    statecitypostcode = ''
    if default_state:
        state = DEFAULT_STATE
    if default_city:
        state = DEFAULT_STATE
        city = DEFAULT_CITY
    if default_postcode:
        state = DEFAULT_STATE
        city = DEFAULT_CITY
        postcode = DEFAULT_POSTCODE
    if state:
        statecitypostcode += state.upper()
        info_message += ", state {}".format(state)
    if city and state:
        statecitypostcode += "#" + city.upper()
        info_message += ", city {}".format(city)
    if postcode and city and state:
        statecitypostcode += "#" + postcode
        info_message += ", postcode {}".format(postcode)
    info_message += "."
    print(info_message)
    key_condition_expression = "Country = :country"
    expression_values = {
        ":country": {"S": country},
    }
    if statecitypostcode:
        key_condition_expression += " AND begins_with(StateCityPostcode, :statecitypostcode)"
        expression_values[':statecitypostcode'] = {"S": statecitypostcode}
        print("The key expression includes a begins_with() function with input of '{}'\n".format(statecitypostcode))
    else:
        print("No statecitypostcode specified. Retrieving all results in Country.\n")
    try:
        resp = client.query(
            TableName="StarbucksLocations",
            IndexName='StoreLocationIndex',
            KeyConditionExpression=key_condition_expression,
            ExpressionAttributeValues=expression_values
        )
        if count:
            print("Retrieved {} locations.".format(resp['Count']))
        else:
            pprint.pprint(resp)
    except Exception as e:
        print("Error running query:")
        print(e)


if __name__ == "__main__":
    query_store_locations()
