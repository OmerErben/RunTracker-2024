import logging
import azure.functions as func
import os
from azure.data.tables import TableClient
import json
import uuid

CONNECTION_STRING = os.getenv('AzureWebJobsStorage')

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request to create a heat map.')

    try:
        if not CONNECTION_STRING:
            logging.error("AzureWebJobsStorage environment variable is not set.")
            return func.HttpResponse("Internal Server Error", status_code=500)

        # Parse the request body
        try:
            req_body = req.get_json()
        except ValueError:
            return func.HttpResponse("Invalid JSON in request body", status_code=400)

        partition_key = req_body.get('partition_key', "Tel Aviv")
        index = req_body.get('index')
        data = req_body.get('data')
        logging.info(f"request from front is {req_body}")
        logging.info(f"partition_key is {partition_key}")

        if index is None or data is None:
            return func.HttpResponse("Name, index, and data are required.", status_code=400)

        coord = data.get('coordination')
        if not coord or 'latitude' not in coord or 'longitude' not in coord:
            return func.HttpResponse("Coordination data is missing or incomplete.", status_code=400)

        latitude = coord['latitude']
        longitude = coord['longitude']

        # Generate a unique name using UUID if index is 0
        if index == 0:
            name = f"route{uuid.uuid4()}"
        else:
            name = req_body.get('row_key')
            if not name:
                return func.HttpResponse("Name is required for non-zero index.", status_code=400)

        logging.info(f"name is {name} and index is {index}")
        # Connect to the tables
        heat_table = TableClient.from_connection_string(CONNECTION_STRING, table_name='HeatMapTable')

        # Add or update the route entity in HeatMapTable
        if index == 0:
            coord_entity = {'PartitionKey': partition_key, 'RowKey': name}
            coord_entity[f'Coord{index}_Lat'] = latitude
            coord_entity[f'Coord{index}_Lon'] = longitude
            logging.info(f"start coord_entity update with {coord_entity}")
            heat_table.create_entity(entity=coord_entity)
            logging.info(f"end coord_entity update with {coord_entity}")
        else:
            try:
                coord_entity = heat_table.get_entity(partition_key=partition_key, row_key=name)
            except:
                coord_entity = {
                    'PartitionKey': partition_key,
                    'RowKey': name
                }

            coord_entity[f'Coord{index}_Lat'] = latitude
            coord_entity[f'Coord{index}_Lon'] = longitude
            heat_table.upsert_entity(entity=coord_entity)

        return func.HttpResponse(json.dumps({"row_key": name, "partition_key": partition_key, "index": index}), status_code=200, mimetype="application/json")

    except Exception as e:
        logging.error(f"Error processing the request: {e}")
        return func.HttpResponse(f"Something went wrong: {e}", status_code=500)
