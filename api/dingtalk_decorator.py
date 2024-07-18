import os
import requests
from flask import request
from werkzeug.exceptions import Unauthorized
from passport import PassportService

user_token_key = '_practical_ai_user'
app_key = os.environ.get('DINGTALK_APP_KEY')
app_secret = os.environ.get('DINGTALK_APP_SECRET')


def get_access_token(f):
    def wrap(*args, **kwargs):
        access_token = _get_access_token()
        if access_token is None:
            return {'errorCode': 400, 'message': 'cannot get access token. check your dingtalk app_key & secret in env'}
        else:
            return f(*args, **{**kwargs, "access_token": access_token})

    return wrap


def login_required(f):
    def wrap(*args, **kwargs):
        user_token = request.cookies.get(user_token_key)
        if user_token is None:
            return {'errorCode': 400, 'message': 'user cookie is empty'}

        try:
            decoded = PassportService().verify(user_token)
        except Unauthorized as e:
            return {'errorCode': 400, 'message': e.description}

        user_id = decoded.get('sub')
        return f(*args, **{**kwargs, 'user_id': user_id})

    return wrap


def _get_access_token():
    headers = {"content-type": "application/json"}
    body = {
        "appKey": app_key,
        "appSecret": app_secret
    }
    res = requests.post(f'https://api.dingtalk.com/v1.0/oauth2/accessToken', json=body, headers=headers)

    if res.status_code == 200:
        data = res.json()
        access_token = data['accessToken']
        return access_token
    else:
        print(res.json())
        return None
