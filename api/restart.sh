git pull
kill $(sudo lsof -i:5002 | grep LISTEN | awk '{print $2}')
nohup gunicorn --bind 0.0.0.0:5002 app:app &