Created with FastAPI, Heroku, and MongoDB Atlas!


# To host this backend locally 
First, install dependencies
```bash
# Install the requirements in a virtual env:
py -m venv .venv
.\\.venv\Scripts\activate       # deactivate to stop using venv
pip install -r requirements.txt
```

Then, setup environment variables
```
DATABASE_URL="mongodb+srv://<username>:<password>@songtags.o5vngfj.mongodb.net/test"
PORT=8000
```

## To host via Heroku Local (recommended)
```
heroku local web -f Procfile.windows
```
Now you can load http://localhost:8000/docs in your browser

## To host via uvicorn (FastAPI default)
```
uvicorn main:app --reload --port=8000
```
Now you can load http://localhost:8000/docs in your browser




# To deploy this backend code to Heroku
You will need to install Heroku CLI
```
heroku config:set LOG_LEVEL=debug
heroku git:remote -a songtagsbackend  
git push heroku master
```
This will create a backend at https://songtagsbackend.herokuapp.com/ 
