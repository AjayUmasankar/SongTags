Created with FastAPI, Heroku, and MongoDB Atlas!

# Initial Steps
First, setup environment variables in a .env file and place it in backend/.env
```
DATABASE_URL="mongodb+srv://<username>:<password>@songtags.o5vngfj.mongodb.net/test"
PORT=8000
```

Then, configure frontend to point to local backend\
You will need to change the URL in BackendNotifier.ts
```
static tagsResource: string = "http://127.0.0.1:8000/tags/ajay/"
```

# Quickstart Backend Server
```
cd /frontend/
npm run backendinstall
npm run backendstart
```


# Deployment to Heroku
You will need to install Heroku CLI
```
heroku config:set LOG_LEVEL=debug
heroku git:remote -a songtagsbackend  
git push heroku master
```
The backend will be hosted at https://songtagsbackend.herokuapp.com/ 
