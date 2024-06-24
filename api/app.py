from flask import Flask
import dotenv

dotenv.load_dotenv()


def create_app():
    _app = Flask(__name__)
    from dingtalk import dingtalk
    _app.register_blueprint(dingtalk)
    return _app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
