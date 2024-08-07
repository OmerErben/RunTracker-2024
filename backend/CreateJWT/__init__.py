import logging
import azure.functions as func
import jwt
import datetime

SECRET_KEY = 'b2c4837a3cdce26f95500827215754e77b1ebebb0569eeebec43a05f9520ba19'


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Generating JWT token.')

    username = req.params.get('username')
    password = req.params.get('password')  # Assuming you're passing password for authentication
    if not username or not password:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            username = req_body.get('username')
            password = req_body.get('password')

    if username and password:
        # Here, you would normally validate the username and password
        # For example, check against a database

        token = jwt.encode(
            {
                'username': username,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
            },
            SECRET_KEY,
            algorithm='HS256'
        )
        return func.HttpResponse(token, status_code=200)
    else:
        return func.HttpResponse(
            "Please pass a username and password in the request body",
            status_code=400
        )
