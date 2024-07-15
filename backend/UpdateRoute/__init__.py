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
        personal_data = req_body.get('personal_data')
        user_name = req_body.get('user_name')
        logging.info(f"data received from front is {req_body}")

        if not partition_key or not row_key or not data:
            return func.HttpResponse("partition_key, row_key, and data are required.", status_code=400)

        # Connect to the RouteMetadata table
        metadata_table = TableClient.from_connection_string(CONNECTION_STRING, table_name='RoutesMetadata')
        personal_metadata_table = TableClient.from_connection_string(CONNECTION_STRING, table_name='RoutePersonalMetadata')

        # Update RoutesMetadata table
        try:
            entity = metadata_table.get_entity(partition_key=partition_key, row_key=row_key)
        except Exception:
            entity = {
                'PartitionKey': partition_key,
                'RowKey': row_key
            }
            for key, value in data.items():
                if not value:
                    continue
                if key == 'score':
                    entity['score'] = float(value)
                    entity['count'] = 1
                else:
                    entity[key] = value
            metadata_table.create_entity(entity=entity)

        try:
            for key, value in data.items():
                if not value:
                    continue
                if key == 'score':
                    if 'score' in entity and 'count' in entity:
                        previous_score = float(entity['score'])
                        count = int(entity['count'])
                        new_score = float(value)
                        new_mean_score = (previous_score * count + new_score) / (count + 1)
                        entity['score'] = float(new_mean_score)
                        entity['count'] = count + 1
                    else:
                        entity['score'] = float(value)
                        entity['count'] = 1
                else:
                    entity[key] = value
            metadata_table.update_entity(entity=entity, mode=UpdateMode.REPLACE)
        except Exception as e:
            logging.error(f"Error updating RoutesMetadata: {e}")
            return func.HttpResponse(f"Error updating RoutesMetadata: {e}", status_code=500)

        # Update RoutePersonalMetadata table
        if personal_data:
            try:
                personal_entity = personal_metadata_table.get_entity(partition_key=user_name, row_key=row_key)
            except Exception:
                personal_entity = {
                    'PartitionKey': user_name,
                    'RowKey': row_key
                }
                for key, value in personal_data.items():
                    if not value:
                        continue
                    personal_entity[key] = value
                personal_metadata_table.create_entity(entity=personal_entity)

            try:
                for key, value in personal_data.items():
                    logging.info(f"for key - {key}, try to enter value - {value}")
                    if (not value and key != "liked") or (key == "liked" and value is None):
                        continue
                    logging.info(f"for key - {key}, entering value - {value}")
                    personal_entity[key] = value
                personal_metadata_table.update_entity(entity=personal_entity, mode=UpdateMode.REPLACE)
            except Exception as e:
                logging.error(f"Error updating RoutePersonalMetadata: {e}")
                return func.HttpResponse(f"Error updating RoutePersonalMetadata: {e}", status_code=500)

        return func.HttpResponse("Route metadata updated successfully.", status_code=200)

    except Exception as e:
        logging.error(f"Error processing the request: {e}")
        return func.HttpResponse(f"Something went wrong: {e}", status_code=500)
