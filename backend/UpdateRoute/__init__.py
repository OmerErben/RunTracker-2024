import logging
import azure.functions as func
import os
from azure.data.tables import TableClient, UpdateMode
import json

CONNECTION_STRING = os.getenv('AzureWebJobsStorage')

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request to update route metadata.')

    try:
        if not CONNECTION_STRING:
            logging.error("AzureWebJobsStorage environment variable is not set.")
            return func.HttpResponse("Internal Server Error", status_code=500)

        # Parse the request body
        try:
            req_body = req.get_json()
        except ValueError:
            return func.HttpResponse("Invalid JSON in request body", status_code=400)

        partition_key = req_body.get('partition_key')
        row_key = req_body.get('row_key')
        data = req_body.get('data')

        if not partition_key or not row_key or not data:
            return func.HttpResponse("partition_key, row_key, and data are required.", status_code=400)

        # Connect to the RouteMetadata table
        metadata_table = TableClient.from_connection_string(CONNECTION_STRING, table_name='RoutesMetadata')

        try:
            # Retrieve the entity
            entity = metadata_table.get_entity(partition_key=partition_key, row_key=row_key)

            # Update or add key-value pairs
            for key, value in data.items():
                if key == 'score':
                    if 'score' in entity and 'count' in entity:
                        # Calculate new mean score
                        previous_score = entity['score']
                        count = entity['count']
                        new_score = value
                        new_mean_score = (previous_score * count + new_score) / (count + 1)
                        entity['score'] = new_mean_score
                        entity['count'] = count + 1
                    else:
                        # If the score or count does not exist, initialize them
                        entity['score'] = value
                        entity['count'] = 1
                else:
                    entity[key] = value

            # Update the entity in the table
            metadata_table.update_entity(entity=entity, mode=UpdateMode.REPLACE)

        except Exception as e:
            # If the entity does not exist, create a new one
            entity = {
                'PartitionKey': partition_key,
                'RowKey': row_key
            }
            for key, value in data.items():
                if key == 'score':
                    entity['score'] = value
                    entity['count'] = 1
                else:
                    entity[key] = value
            metadata_table.create_entity(entity=entity)

        return func.HttpResponse("Route metadata updated successfully.", status_code=200)

    except Exception as e:
        logging.error(f"Error processing the request: {e}")
        return func.HttpResponse(f"Something went wrong: {e}", status_code=500)
