Backend API is 
* built on Python 3.10.0 and FastAPI,
* hosted on Railway,
* and uses ~~MongoDB Atlas (absolutely awful)~~ Supabase's Postgres database!

Frontend/Chrome extension is developed in vanilla TS

# Local Development Quickstart
## Prerequisites
NodeJS 18.15.0
Python 3.10

## Environment Variables Setup
First, setup environment variables in a .env file and place it in `backend/database/.env`
```
CONNECTION_STRING="postgres://postgres:Dontnotdie1337@db.rsirtgzvfzdoakaajals.supabase.co:6543/postgres"
PORT=8000
```


## Host Local Backend AND Watch Frontend
Frontend changes will automatically be built on filesave, you will need to load the extension again on chrome.
Backend changes will automatically be updated on file save!
```
cd /frontend/
npm run setup
npm start
```
The frontend/chrome extension can be loaded on chrome by choosing Load Unpacked and pointing to the `frontend/extension` folder


