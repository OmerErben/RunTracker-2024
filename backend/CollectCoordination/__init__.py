import logging
import azure.functions as func
import os
from azure.data.tables import TableClient, UpdateMode
import json
import uuid

CONNECTION_STRING = os.getenv('AzureWebJobsStorage')

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request to collect coordination.')

    try:
        if not CONNECTION_STRING:
            logging.error("AzureWebJobsStorage environment variable is not set.")
            return func.HttpResponse("Internal Server Error", status_code=500)

        # Parse the request body
        try:
            req_body = req.get_json()
        except ValueError:
            return func.HttpResponse("Invalid JSON in request body", status_code=400)

        city = req_body.get('partition_key', 'Tel Aviv')
        index = req_body.get('index')
        finish_status = req_body.get('finish_status')
        data = req_body.get('data')
        logging.info(f"request from front is {req_body}")

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
        route_table = TableClient.from_connection_string(CONNECTION_STRING, table_name='RoutesCordinations')
        coord_table = TableClient.from_connection_string(CONNECTION_STRING, table_name='AllRouteCoordinations')

        # Add or update the route entity in RoutesCordinations
        if index == 0:
            route_entity = {
                'PartitionKey': city,
                'RowKey': name,
                'start_cord_latitude': latitude,
                'start_cord_longitude': longitude
            }
            route_table.create_entity(entity=route_entity)
            # Also create the initial entity in AllRouteCoordinations
            coord_entity = {'PartitionKey': city, 'RowKey': name}
            coord_entity[f'Coord{index}_Lat'] = latitude
            coord_entity[f'Coord{index}_Lon'] = longitude
            coord_table.create_entity(entity=coord_entity)
        else:
            if finish_status:
                try:
                    route_entity = route_table.get_entity(partition_key=city, row_key=name)
                    route_entity['end_cord_latitude'] = latitude
                    route_entity['end_cord_longitude'] = longitude
                    route_table.update_entity(entity=route_entity, mode=UpdateMode.REPLACE)
                except Exception as e:
                    logging.error(f"Error updating route entity: {e}")
                    return func.HttpResponse("Error updating route entity", status_code=500)

            # Add coordinates to AllRouteCoordinations
            try:
                coord_entity = coord_table.get_entity(partition_key=city, row_key=name)
            except:
                coord_entity = {
                    'PartitionKey': city,
                    'RowKey': name
                }

            coord_entity[f'Coord{index}_Lat'] = latitude
            coord_entity[f'Coord{index}_Lon'] = longitude
            coord_table.upsert_entity(entity=coord_entity)

        return func.HttpResponse(json.dumps({"row_key": name, "partition_key": city}), status_code=200, mimetype="application/json")

    except Exception as e:
        logging.error(f"Error processing the request: {e}")
        return func.HttpResponse(f"Something went wrong: {e}", status_code=500)
