Created with FastAPI, Heroku, and MongoDB Atlas!

# Local Development Quickstart
## Environment Variables Setup
First, setup environment variables in a .env file and place it in `backend/.env`
```
DATABASE_URL="mongodb+srv://<username>:<password>@songtags.o5vngfj.mongodb.net/test"
PORT=8000
```


## Host Local Backend AND Watch Frontend
Frontend changes will automatically be built on filesave, you will only need to load the extension again.\
Backend changes will automatically be in a working state on file save.
```
cd /frontend/
npm run setup
npm start
```
The frontend/chrome extension can be loaded by pointing to the `frontend/extension` folder


