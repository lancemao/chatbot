import json
import os
import hashlib

from flask import request, Blueprint, Response, jsonify, make_response
from flask_restful import Resource, Api
from werkzeug.exceptions import Unauthorized
import requests
from passport import PassportService
from datetime import datetime, timedelta, timezone
import time

agent_id = os.environ.get('DINGTALK_AGENT_ID')
app_key = os.environ.get('DINGTALK_APP_KEY')
app_secret = os.environ.get('DINGTALK_APP_SECRET')
json_header = {"content-type": "application/json"}
user_token_key = '_practical_ai_user'

dingtalk = Blueprint('dingtalk', __name__, url_prefix='/agent/dingtalk')

api = Api(dingtalk)


class DDGetJSTicketApi(Resource):
    @staticmethod
    def get():
        access_token = get_access_token()
        if access_token is None:
            return {'errorCode': 400, 'message': 'cannot get access token'}

        res = requests.get(f'https://oapi.dingtalk.com/get_jsapi_ticket?access_token={access_token}')
        if res.status_code == 200:
            data = res.json()
            ticket = data['ticket']
            args = request.args
            url = args.get('url')

            nonce = '1234567890'
            time_stamp = int(round(time.time() * 1000))
            plain_text = f"jsapi_ticket={ticket}&noncestr={nonce}&timestamp={time_stamp}&url={url}"
            hash_object = hashlib.sha256(plain_text.encode())
            signature = hash_object.hexdigest()

            data['signature'] = signature
            data['agentId'] = agent_id
            data['timeStamp'] = time_stamp
            data['nonceStr'] = nonce

            response = make_response(data)
            response.headers['Content-Type'] = 'application/json'
            return response
        return Response(res.iter_content(), res.status_code, headers=json_header)


class DDGetUserInfoApi(Resource):
    @staticmethod
    def get():
        args = request.args
        code = args.get('code')
        if code is None:
            data = {'errorCode': 400, 'message': 'auth code is None'}
            return json.dumps(data, ensure_ascii=False)

        access_token = get_access_token()
        if access_token is None:
            return {'errorCode': 400, 'message': 'cannot get access token'}

        body = {
            "code": code
        }
        res = requests.post(f'https://oapi.dingtalk.com/topapi/v2/user/getuserinfo?access_token={access_token}',
                            json=body)

        if res.status_code == 200:
            data = res.json()
            # print(data)
            errcode = data['errcode']
            if errcode == 0:
                user = data['result']
                user_id = user['userid']
                user_detail = get_user_detail(access_token, user_id)
                if user_detail is not None:
                    user['detail'] = user_detail
                payload = {
                    "sub": user_id,
                    "exp": datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=30),
                    "iss": 'Practical AI'
                }
                token = PassportService().issue(payload)

                response = make_response(data)
                response.headers['Content-Type'] = 'application/json'
                response.status_code = res.status_code
                response.set_cookie(user_token_key, token)
                return response

        return Response(res.iter_content(), res.status_code, headers=json_header)


class DDCreateProcessApi(Resource):
    @staticmethod
    def get(process_id):
        access_token = get_access_token()
        if access_token is None:
            return 'cannot get access token'

        args = request.args
        reason = args.get('reason')

        try:
            user_token = request.cookies.get(user_token_key)
            decoded = PassportService().verify(user_token)
            user_id = decoded.get('sub')
        except Unauthorized:
            return jsonify({'message': Unauthorized.args[0]}), 200

        body = {
            "process_code": process_id,
            "originator_user_id": user_id,
            "dept_id": "0",
            "form_component_values": [{
                "name": "申请理由",
                "value": reason
            }]
        }

        res = requests.post(f'https://oapi.dingtalk.com/topapi/processinstance/create?access_token={access_token}',
                            json=body)

        if res.status_code == 200:
            data = res.json()
            if data['errcode'] == 0:
                return json.dumps({'errorCode': 0, 'message': '已成功提交审批电子流'}, ensure_ascii=False)

        proxy_response = Response(
            res.iter_content(),
            res.status_code,
            headers=json_header
        )
        return proxy_response


def get_access_token():
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


def get_user_access_token(code):
    headers = {"content-type": "application/json"}
    body = {
        "clientId": app_key,
        "clientSecret": app_secret,
        "code": code,
        "grantType": 'authorization_code'
    }
    res = requests.post('https://api.dingtalk.com/v1.0/oauth2/userAccessToken', headers=headers, json=body)

    if res.status_code == 200:
        data = res.json()
        print(data)
        access_token = data['accessToken']
        return access_token
    else:
        print(res.json())
        return None


def get_user_detail(access_token, user_id):
    headers = {"content-type": "application/json"}
    body = {
        "userid": user_id
    }

    res = requests.post(f'https://oapi.dingtalk.com/topapi/v2/user/get?access_token={access_token}',
                        headers=headers, json=body)

    if res.status_code == 200:
        data = res.json()
        # print(data)
        return data['result']
    else:
        print(res.json())
        return None


class DDGetApiVersion(Resource):
    @staticmethod
    def get():
        return '0.0.1'


api.add_resource(DDGetJSTicketApi, '/get-js-api-signature')
api.add_resource(DDGetUserInfoApi, '/get-user-info')
api.add_resource(DDCreateProcessApi, '/process/create/<process_id>')
api.add_resource(DDGetApiVersion, '/version')
