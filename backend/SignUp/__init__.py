import logging
import azure.functions as func
import os
from azure.data.tables import TableClient, Entity


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a signup request.')

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
            # Try to retrieve the entity to check if the user already exists
            entity = table_client.get_entity(partition_key="UserPartition", row_key=username)

            # If the entity is found, the user already exists
            return func.HttpResponse("User already exists.", status_code=409)

        except Exception as e:
            # If the entity is not found, proceed to add the new user
            new_entity = {
                'PartitionKey': "UserPartition",
                'RowKey': username,
                'password': password
            }
            table_client.create_entity(entity=new_entity)
            return func.HttpResponse("User created successfully.", status_code=201)

    except Exception as e:
        logging.error(f"Error processing the request: {e}")
        return func.HttpResponse(f"Something went wrong {e}", status_code=500)
