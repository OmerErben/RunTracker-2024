import jwt
from functools import wraps
from azure.functions import HttpRequest, HttpResponse

SECRET_KEY = 'b2c4837a3cdce26f95500827215754e77b1ebebb0569eeebec43a05f9520ba19'

def jwt_required(func):
    @wraps(func)
    def decorated_function(req: HttpRequest, *args, **kwargs):
        token = req.headers.get('Authorization')
        if token is None:
            return HttpResponse('Token is missing!', status_code=401)
        try:
            jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return HttpResponse('Token has expired!', status_code=401)
        except jwt.InvalidTokenError:
            return HttpResponse('Invalid token!', status_code=401)
        return func(req, *args, **kwargs)
    return decorated_function
