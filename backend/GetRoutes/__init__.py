import logging
import azure.functions as func
import os
from azure.data.tables import TableClient
import json
from typing import Dict

CONNECTION_STRING = os.getenv('AzureWebJobsStorage')


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request to retrieve route coordinations.')

    try:
        if not CONNECTION_STRING:
            logging.error("AzureWebJobsStorage environment variable is not set.")
            return func.HttpResponse("Internal Server Error", status_code=500)

        # Connect to the tables
        route_table = TableClient.from_connection_string(CONNECTION_STRING, table_name='RoutesCordinations')
        metadata_table = TableClient.from_connection_string(CONNECTION_STRING, table_name='RoutesMetadata')
        route_coordinations_table = TableClient.from_connection_string(CONNECTION_STRING, table_name='AllRouteCoordinations')
        personal_metadata_table = TableClient.from_connection_string(CONNECTION_STRING, table_name='RoutePersonalMetadata')

        # Get partition key and user name from request parameters
        partition_key = req.params.get('partitionKey', "Tel Aviv")
        user_name = req.params.get('user_name')
        if not partition_key:
            return func.HttpResponse("PartitionKey is required.", status_code=400)

        # Query the table for all entities with the specified PartitionKey
        entities = list(route_table.query_entities(f"PartitionKey eq '{partition_key}'"))
        metadata_entities = list(metadata_table.query_entities(f"PartitionKey eq '{partition_key}'"))

        # Convert the metadata entities to a dictionary for quick lookup
        metadata_dict = {entity['RowKey']: entity for entity in metadata_entities}

        # Collect the entities in a list
        results = []
        for entity in entities:
            parsed_entity = parse_entity(dict(entity))
            parsed_entity["data"] = get_coordinates(route_coordinations_table, partition_key, parsed_entity.get('row_key'))

            # Get the metadata for the same RowKey
            metadata_entity = metadata_dict.get(parsed_entity.get('row_key'))
            if metadata_entity:
                # Remove PartitionKey and RowKey from metadata entity to avoid overwriting
                metadata_entity.pop('PartitionKey', None)
                metadata_entity.pop('RowKey', None)
                parsed_entity.update(metadata_entity)

            # Get the personal metadata for the user
            if user_name:
                try:
                    personal_metadata_entity = personal_metadata_table.get_entity(partition_key=user_name, row_key=parsed_entity.get('row_key'))
                    personal_metadata_dict = dict(personal_metadata_entity)
                    personal_metadata_dict.pop('PartitionKey', None)
                    personal_metadata_dict.pop('RowKey', None)
                    parsed_entity.update(personal_metadata_dict)
                except Exception as e:
                    logging.info(f"No personal metadata found for user {user_name} and route {parsed_entity.get('row_key')}")
            logging.info(parsed_entity)
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
    parsed_dict["partition_key"] = entity.get("PartitionKey")
    return parsed_dict


def get_coordinates(table_client, partition_key, row_key):
    try:
        # Retrieve the entity
        entity = table_client.get_entity(partition_key=partition_key, row_key=row_key)

        # Extract coordinates from the entity
        temp_coordinates = []
        for key, value in entity.items():
            if key.startswith("Coord") and key.endswith("_Lat"):
                coord_id = key.split("_")[0]
                latitude = value
                longitude = entity.get(f"{coord_id}_Lon")
                if latitude is not None and longitude is not None:
                    temp_coordinates.append((int(coord_id[5:]), latitude, longitude))

        temp_coordinates.sort()
        coordinates = [{"latitude": lat, "longitude": lon} for num, lat, lon in temp_coordinates]
        return coordinates
    except Exception as e:
        logging.error(f"Error retrieving coordinates for route {row_key}: {e}")
        return []
