import logging
import azure.functions as func
import os
from azure.data.tables import TableClient
import json
from jwt_auth import jwt_required

CONNECTION_STRING = os.getenv('AzureWebJobsStorage')

@jwt_required
def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request to remove a route.')
    try:
        if not CONNECTION_STRING:
            logging.error("AzureWebJobsStorage environment variable is not set.")
            return func.HttpResponse("Internal Server Error", status_code=500)

        # Connect to the tables
        route_table = TableClient.from_connection_string(CONNECTION_STRING, table_name='RoutesCordinations')
        metadata_table = TableClient.from_connection_string(CONNECTION_STRING, table_name='RoutesMetadata')
        route_coordinations_table = TableClient.from_connection_string(CONNECTION_STRING,
                                                                       table_name='AllRouteCoordinations')

        # Get partition key and row key from request body
        try:
            req_body = req.get_json()
        except ValueError:
            return func.HttpResponse("Invalid JSON in request body", status_code=400)

        partition_key = req_body.get('partition_key')
        row_key = req_body.get('row_key')
        if not partition_key or not row_key:
            return func.HttpResponse("PartitionKey and RowKey are required.", status_code=400)

        # Remove the entity from the tables
        remove_entity(route_table, partition_key, row_key)
        remove_entity(metadata_table, partition_key, row_key)
        remove_entity(route_coordinations_table, partition_key, row_key)

        return func.HttpResponse(f"Route {row_key} removed successfully.", status_code=200)

    except Exception as e:
        logging.error(f"Error processing the request: {e}")
        return func.HttpResponse(f"Something went wrong: {e}", status_code=500)


def remove_entity(table_client, partition_key, row_key):
    try:
        table_client.delete_entity(partition_key=partition_key, row_key=row_key)
        logging.info(f"Entity with PartitionKey: {partition_key} and RowKey: {row_key} removed successfully.")
    except Exception as e:
        logging.error(f"Error removing entity with PartitionKey: {partition_key} and RowKey: {row_key}: {e}")
