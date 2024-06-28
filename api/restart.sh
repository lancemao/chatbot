git pull
pip install -r requirements.txt
pkill gunicorn
nohup gunicorn --bind 0.0.0.0:5002 app:app > output.log 2>&1 &