import os

from flask import request, Blueprint, jsonify
from flask_restful import Resource, Api

from dingtalk_decorator import login_required


my_info = Blueprint('my_info', __name__, url_prefix='/agent/common')
api = Api(my_info)


class SaveMyInfoApi(Resource):
    def __init__(self):
        folder_path = 'data'
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)

    @staticmethod
    @login_required
    def post(user_id):
        args = request.get_json()
        text = args['text'] if 'text' in args else ''
        try:
            with open(f'data/{user_id}.txt', 'w') as file:
                file.write(text)
                return jsonify({'errorCode': 0, 'message': 'saved'})
        except IOError:
            return jsonify({'errorCode': 500, 'message': 'Internal Server IO Exception'})

    @staticmethod
    @login_required
    def get(user_id):
        try:
            with open(f'data/{user_id}.txt', 'r') as file:
                content = file.read()
        except FileNotFoundError:
            content = '' # valid case not an error
        except IOError:
            return jsonify({'errorCode': 500, 'content': 'Internal Server IO Exception'})
        return jsonify({'errorCode': 0, 'content': content})


api.add_resource(SaveMyInfoApi, '/save-my-info')
