Created with FastAPI, Heroku, and MongoDB Atlas!

# Local Development Quickstart
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


# Install Requirements & Launch Backend & Watch Frontend
```
cd /frontend/
npm run fullinstall
npm start
```
The backend server will refresh upon any change to .py files
The frontend google chrome extension will autocompile to `frontend/extensionbuilt/` whenever any file in `frontend/extension/` is changed

Refer to readme in frontend or backend for more information