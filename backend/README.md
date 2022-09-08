Created with FastAPI, Heroku, and MongoDB Atlas!


# To host this backend locally
```bash
# Install the requirements in a virtual env:
py -m venv .venv
.\\.venv\Scripts\activate       # deactivate to stop using venv
pip install -r requirements.txt

# Start the service:
uvicorn main:app --reload
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
