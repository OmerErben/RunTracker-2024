import logging
import azure.functions as func
import os
from azure.data.tables import TableClient
import json


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request to retrieve route coordinations.')

    try:


        # Get the connection string
        connection_string = os.getenv('AzureWebJobsStorage')

        # Connect to the table
        table_client = TableClient.from_connection_string(connection_string, table_name='RoutesCordinations')

        partition_key = req.params.get('partitionKey', "Tel Aviv")
        if not partition_key:
            return func.HttpResponse("PartitionKey is required.", status_code=400)

        entities = table_client.query_entities(f"PartitionKey eq '{partition_key}'")

        # Collect the entities in a list
        results = []
        for entity in entities:
            results.append(entity)

        response_body = json.dumps(results)
        return func.HttpResponse(response_body, status_code=200, mimetype="application/json")

    except Exception as e:
        logging.error(f"Error processing the request: {e}")
        return func.HttpResponse(f"Something went wrong: {e}", status_code=500)
