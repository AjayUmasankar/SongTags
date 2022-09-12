Created with FastAPI, Heroku, and MongoDB Atlas!

# Setup 
## Install Requirements
```bash
# Install the requirements in a virtual env:
py -m venv .venv
.\\.venv\Scripts\activate       # deactivate to stop using venv
pip install -r requirements.txt
```

## Setup environment variables
Then, setup environment variables in a .env file
```
DATABASE_URL="mongodb+srv://<username>:<password>@songtags.o5vngfj.mongodb.net/test"
PORT=8000
```

# Hosting the backend locally (w/ automatic reload)
## To host via uvicorn (FastAPI default)
```
.\\.venv\Scripts\activate
uvicorn main:app --reload --port=8000
```

## To host via Heroku Local (wont show debug output??)
```
.\\.venv\Scripts\activate
heroku local web -f Procfile.windows
```

## Configure frontend to point to local backend
You will need to change the URL in BackendNotifier


# Deployment 
## To deploy this backend code to Heroku
You will need to install Heroku CLI
```
heroku config:set LOG_LEVEL=debug
heroku git:remote -a songtagsbackend  
git push heroku master
```
The backend will be hosted at https://songtagsbackend.herokuapp.com/ 
