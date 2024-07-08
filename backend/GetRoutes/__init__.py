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
        metadata_table = TableClient.from_connection_string(connection_string, table_name='RoutesMetadata')

        # Connect to the table
        route_table = TableClient.from_connection_string(connection_string, table_name='RoutesCordinations')

        # Get partition key from request parameters
        partition_key = req.params.get('partitionKey', "Tel Aviv")
        if not partition_key:
            return func.HttpResponse("PartitionKey is required.", status_code=400)

        # Query the table for all entities with the specified PartitionKey
        entities = route_table.query_entities(f"PartitionKey eq '{partition_key}'")
        # Query the metadata table for all entities with the specified PartitionKey
        metadata_entities = list(metadata_table.query_entities(f"PartitionKey eq '{partition_key}'"))

        # Convert the metadata entities to a dictionary for quick lookup
        metadata_dict = {entity['RowKey']: entity for entity in metadata_entities}

        # Collect the entities in a list
        results = []
        for entity in entities:
            parsed_entity = parse_entity(dict(entity))

            # Get the metadata for the same RowKey
            metadata_entity = metadata_dict.get(parsed_entity.get('row_key'))
            if metadata_entity:
                parsed_entity.update(metadata_entity)

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
    parsed_dict["row_key"] = entity.get("RowKey")
    return parsed_dict
