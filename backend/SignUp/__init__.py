import logging
import azure.functions as func
import os
from azure.data.tables import TableClient
import json
import jwt
import datetime

SECRET_KEY = 'b2c4837a3cdce26f95500827215754e77b1ebebb0569eeebec43a05f9520ba19'

def main(req: func.HttpRequest, signalrHub: func.Out[str]) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a signup request.')

    try:
        # Get the username and password from query parameters
        username = req.params.get('username')
        password = req.params.get('password')
        logging.info(f"username is {username} and password is {password}")

        if not username or not password:
            return func.HttpResponse("Username and password are required.", status_code=400)

        # Get the connection string
        connection_string = os.getenv('AzureWebJobsStorage')
        if not connection_string:
            logging.error("AzureWebJobsStorage environment variable is not set.")
            return func.HttpResponse("Internal Server Error", status_code=500)

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
                'password': password,
                'superUser': False
            }
            table_client.create_entity(entity=new_entity)

            # Generate JWT token
            token = jwt.encode(
                {
                    'username': username,
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
                },
                SECRET_KEY,
                algorithm='HS256'
            )

            response = {
                "token": token,
                "superUser": False
            }

            return func.HttpResponse(json.dumps(response), status_code=201, mimetype="application/json")

    except Exception as e:
        logging.error(f"Error processing the request: {e}")
        return func.HttpResponse(f"Something went wrong: {e}", status_code=500)
