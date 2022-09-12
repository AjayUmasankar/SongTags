Created with FastAPI, Heroku, and MongoDB Atlas!

# Initial Steps
First, setup environment variables in a .env file and place it in backend/.env
```
DATABASE_URL="mongodb+srv://<username>:<password>@songtags.o5vngfj.mongodb.net/test"
PORT=8000
```

Then, configure frontend to point to local backend
You will need to change the URL in BackendNotifier.ts
```
static tagsResource: string = "http://127.0.0.1:8000/tags/ajay/"
```


# Install Requirements (w/ venv) 
```
cd /frontend/
npm run backendinstall
```

# Launch Backend Webserver (w/ automatic reload on code change via Uvicorn)
Go to /frontend/
```bash
npm run backendstart
```


~~~Alternatively, we can use Heroku Local but there wont be any debug output
```
.\\.venv\Scripts\activate
heroku local web -f Procfile.windows
```
~~~



# Deployment to Heroku
You will need to install Heroku CLI
```
heroku config:set LOG_LEVEL=debug
heroku git:remote -a songtagsbackend  
git push heroku master
```
The backend will be hosted at https://songtagsbackend.herokuapp.com/ 
