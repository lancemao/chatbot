import json
import os
import hashlib

from flask import request, Blueprint, Response, jsonify, make_response
from flask_restful import Resource, Api
from werkzeug.exceptions import Unauthorized
import requests

from dingtalk_decorator import login_required, get_access_token
from passport import PassportService
from datetime import datetime, timedelta, timezone
import time

agent_id = os.environ.get('DINGTALK_AGENT_ID')
app_key = os.environ.get('DINGTALK_APP_KEY')
app_secret = os.environ.get('DINGTALK_APP_SECRET')
op_user_id = os.environ.get('DINGTALK_OP_USER_ID')
json_header = {"content-type": "application/json"}
user_token_key = '_practical_ai_user'

dingtalk = Blueprint('dingtalk', __name__, url_prefix='/agent/dingtalk')

api = Api(dingtalk)


class DDGetJSTicketApi(Resource):
    @staticmethod
    @get_access_token
    def get(access_token):
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
    @get_access_token
    def get(access_token):
        args = request.args
        code = args.get('code')
        if code is None:
            data = {'errorCode': 400, 'message': 'auth code is None'}
            return json.dumps(data, ensure_ascii=False)

        body = {
            "code": code
        }
        res = requests.post(f'https://oapi.dingtalk.com/topapi/v2/user/getuserinfo?access_token={access_token}',
                            json=body)

        if res.status_code == 200:
            data = res.json()
            print(data)
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


class DDGetUserInfoDesApi(Resource):
    @staticmethod
    @get_access_token
    @login_required
    def get(access_token, user_id):
        try:
            user_detail = get_user_detail(access_token, user_id)
            print(user_detail)

            if user_detail is not None:
                uid = f"我的用户 ID（user ID）是{user_detail['userid']}" if 'userid' in user_detail and user_detail['userid'] else ''
                unionid = f"我的 Union ID（unionid）是{user_detail['unionid']}" if 'unionid' in user_detail and user_detail[
                    'unionid'] else ''
                name = f"我的名字是{user_detail['name']}" if user_detail['name'] else ''
                nickname = f"我的昵称是{user_detail['nickname']}" if 'nickname' in user_detail and user_detail['nickname'] else ''
                email = f"我的邮箱是{user_detail['email']}" if 'email' in user_detail and user_detail['email'] else ''
                mobile = f"我的手机号码是{user_detail['mobile']}" if 'mobile' in user_detail and user_detail['mobile'] else ''
                icon = f"我的头像链接是{user_detail['avatar']}" if 'avatar' in user_detail and user_detail['avatar'] else ''
                employee_id = f"我的工号是{user_detail['job_number']}，这也是我登录钉钉的账号名" if 'job_number' in user_detail and user_detail['job_number'] else ''
                des = f"{uid}\n{unionid}\n{name}\n{nickname}\n{email}\n{mobile}\n{icon}\n{employee_id}"

                # read user specific data
                try:
                    with open(f'data/{user_id}.txt', 'r') as file:
                        content = file.read()
                        des = des + '\n\n' + content
                except FileNotFoundError:
                    pass
                except IOError:
                    pass

                print(des)
                return des
            else:
                return {'message': 'cannot get user info'}, 200
        except Unauthorized as e:
            return {'message': e.description}, 200


class DDCreateProcessApi(Resource):
    @staticmethod
    @get_access_token
    def get(access_token, process_id):
        args = request.args
        reason = args.get('reason')

        try:
            user_token = request.cookies.get(user_token_key)
            decoded = PassportService().verify(user_token)
            user_id = decoded.get('sub')
        except Unauthorized as e:
            return jsonify({'message': e.description}), 200

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
                return {'errorCode': 0, 'message': '已成功提交审批电子流'}

        proxy_response = Response(
            res.iter_content(),
            res.status_code,
            headers=json_header
        )
        return proxy_response


class DDLeaveQuotaApi(Resource):
    @staticmethod
    @get_access_token
    @login_required
    def post(access_token, user_id):
        args = request.get_json()
        annual_leave_code = args['annual_leave_code'] if 'annual_leave_code' in args else None
        shift_leave_code = args['shift_leave_code'] if 'shift_leave_code' in args else None

        if annual_leave_code is None and shift_leave_code is None:
            return {'message': 'no leave type(s) specified'}, 400

        annual_result = get_leave_in(access_token, user_id, annual_leave_code, '年假')
        shift_result = get_leave_in(access_token, user_id, shift_leave_code, '调休')

        if annual_result is not None or shift_result is not None:
            return f"{annual_result}.\n\n{shift_result}"

        return f"cannot get your leave information"


class DDAssetApi(Resource):
    @staticmethod
    @get_access_token
    @login_required
    def post(access_token, user_id):
        args = request.get_json()
        app_type = args['appType'] if 'appType' in args else ''
        system_token = args['systemToken'] if 'systemToken' in args else ''
        form_uuid = args['formUuid'] if 'formUuid' in args else ''

        headers = {
            "content-type": "application/json",
            "x-acs-dingtalk-access-token": access_token
        }
        body = {
            "appType": app_type,
            "systemToken": system_token,
            "userId": user_id,
            "formUuid": form_uuid,
            "originatorId": user_id
        }

        res = requests.post(f'https://api.dingtalk.com/v1.0/yida/forms/instances/search',
                            headers=headers, json=body)

        if res.status_code == 200:
            data = res.json()
            # print(data)
            return data['data']
        else:
            proxy_response = Response(
                res.iter_content(),
                res.status_code,
                headers=json_header
            )
            return proxy_response


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
        print(data)
        if data['errcode'] == 0:
            return data['result']

    return None


def get_leave_in(access_token, user_id, leave_code, leave_type):
    body = {
        "leave_code": leave_code,
        "op_userid": op_user_id,
        "userids": user_id,
        "offset": 0,
        "size": 10
    }

    res = requests.post(f'https://oapi.dingtalk.com/topapi/attendance/vacation/quota/list?access_token={access_token}',
                        json=body)

    try:
        if res.status_code == 200:
            data = res.json()
            # print(data)
            if data['errcode'] == 0:
                result = data['result']
                if 'leave_quotas' in result:
                    leave_quotas = result['leave_quotas']
                    total = 0
                    used = 0
                    remain = 0
                    unit = '天'
                    for leave_quota in leave_quotas:
                        if 'quota_num_per_day' in leave_quota:
                            unit = '天'
                            total += leave_quota['quota_num_per_day'] / 100
                            used += leave_quota['used_num_per_day'] / 100
                        elif 'quota_num_per_hour' in leave_quota:
                            unit = '小时'
                            total += leave_quota['quota_num_per_hour'] / 100
                            used += leave_quota['used_num_per_hour'] / 100
                        remain = total - used
                    return (f"你的{leave_type}配额为 {total} {unit}, "
                            f"你已经请了{used}{unit}{leave_type}, "
                            f"你还剩余{remain}{unit}{leave_type}")
                else:
                    return f"你没有{leave_type}信息"
    except:
        pass

    return None


api.add_resource(DDGetJSTicketApi, '/get-js-api-signature')
api.add_resource(DDGetUserInfoApi, '/get-user-info')
api.add_resource(DDGetUserInfoDesApi, '/get-user-info-des')
api.add_resource(DDCreateProcessApi, '/process/create/<process_id>')
api.add_resource(DDLeaveQuotaApi, '/leave/quota')
api.add_resource(DDAssetApi, '/asset/my')
