import logging
import azure.functions as func
import os
from azure.data.tables import TableClient
import json
from typing import Dict

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request to retrieve route coordinations.')

    try:
        # Get the connection string
        connection_string = os.getenv('AzureWebJobsStorage')
        if not connection_string:
            logging.error("AzureWebJobsStorage environment variable is not set.")
            return func.HttpResponse("Internal Server Error", status_code=500)

        # Connect to the table
        table_client = TableClient.from_connection_string(connection_string, table_name='RoutesCordinations')

        # Get partition key from request parameters
        partition_key = req.params.get('partitionKey', "Tel Aviv")
        if not partition_key:
            return func.HttpResponse("PartitionKey is required.", status_code=400)

        # Query the table for all entities with the specified PartitionKey
        entities = table_client.query_entities(f"PartitionKey eq '{partition_key}'")

        # Collect the entities in a list
        results = []
        for entity in entities:
            parsed_entity = parse_entity(dict(entity))
            results.append(parsed_entity)

        # Convert the results to JSON
        response_body = json.dumps(results, default=str)  # default=str to handle any non-serializable fields
        return func.HttpResponse(response_body, status_code=200, mimetype="application/json")

    except Exception as e:
        logging.error(f"Error processing the request: {e}")
        return func.HttpResponse(f"Something went wrong: {e}", status_code=500)

def parse_entity(entity: Dict) -> Dict:
    parsed_dict = {}
    parsed_dict["start"] = {"latitude": entity.get("start_cord_latitude"), "longitude": entity.get("start_cord_longitude")}
    parsed_dict["end"] = {"latitude": entity.get("end_cord_latitude"), "longitude": entity.get("end_cord_longitude")}
    return parsed_dict
