import logging
import azure.functions as func
import os
from azure.data.tables import TableClient
import json

CONNECTION_STRING = os.getenv('AzureWebJobsStorage')


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request to retrieve heat map coordinations.')

    try:
        if not CONNECTION_STRING:
            logging.error("AzureWebJobsStorage environment variable is not set.")
            return func.HttpResponse("Internal Server Error", status_code=500)

        # Connect to the HeatMapTable
        heat_map_table = TableClient.from_connection_string(CONNECTION_STRING, table_name='HeatMapTable')

        # Query the table for all entities
        entities = list(heat_map_table.list_entities())

        logging.info(f"entities are {entities}")
        # Process each entity to filter columns and format data
        results = []
        for entity in entities:
            parsed_entity = parse_entity(entity)
            results.append(parsed_entity)

        # Convert the results to JSON
        response_body = json.dumps(results, default=str)  # default=str to handle any non-serializable fields
        return func.HttpResponse(response_body, status_code=200, mimetype="application/json")

    except Exception as e:
        logging.error(f"Error processing the request: {e}")
        return func.HttpResponse(f"Something went wrong: {e}", status_code=500)


def parse_entity(entity):
    parsed_dict = {
        "partition_key": entity["PartitionKey"],
        "row_key": entity["RowKey"],
        "data": []
    }

    for key, value in entity.items():
        if key.startswith("Coord") and key.endswith("_Lat"):
            index = key.split("_")[0]
            latitude = value
            longitude = entity.get(f"{index}_Lon")
            if latitude is not None and longitude is not None:
                parsed_dict["data"].append({"latitude": latitude, "longitude": longitude})

    return parsed_dict
