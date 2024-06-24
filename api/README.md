# Get Started

## Develop locally

1. install dependencies

```shell
pip install -r requirements.txt
```

2. Save a copy of .env.example as .env and change all the environment variables accordingly


3. start service

```shell
flask run --host=0.0.0.0 --port=5002 --debug
```

Then start your frontend locally as well and everything should work 
since we already set up route forwarding in vite config 

## Deploy

a simple way is to clone this repo on your VM and under api folder, run:

```shell
. restart.sh
```

make sure you have *gunicorn* installed on your VM

## Nginx

Our service listens on port 5002, so if you are using nginx, you need to set:

```shell
location /agent {
    proxy_pass http://127.0.0.1:5002;
}
```