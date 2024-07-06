import logging
import azure.functions as func
import os
from azure.data.tables import TableClient


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    try:
        # Get the request body
        req_body = req.get_json()
        username = req_body.get('username')
        password = req_body.get('password')

        if not username or not password:
            return func.HttpResponse("Username and password are required.", status_code=400)

        # Get the connection string
        connection_string = os.getenv('AzureWebJobsStorage')

        # Connect to the table
        table_client = TableClient.from_connection_string(connection_string, table_name='AuthenticationTable')

        try:
            # Retrieve the entity
            entity = table_client.get_entity(partition_key="UserPartition", row_key=username)

            # Check if the password matches
            if entity.get('password') == password:
                return func.HttpResponse("True", status_code=200)
            else:
                return func.HttpResponse("False", status_code=401)

        except Exception as e:
            logging.error(f"Entity not found or error: {e}")
            return func.HttpResponse("False", status_code=404)

    except Exception as e:
        logging.error(f"Error processing the request: {e}")
        return func.HttpResponse(f"Something went wrong {e}", status_code=500)
