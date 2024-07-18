from flask import Flask
import dotenv

dotenv.load_dotenv()


def create_app():
    _app = Flask(__name__)
    from dingtalk import dingtalk
    _app.register_blueprint(dingtalk)
    from common.my_info import my_info
    _app.register_blueprint(my_info)
    return _app


app = create_app()


@app.route('/agent/version')
def version():
    return "0.0.1"


if __name__ == '__main__':
    app.run(debug=True)
