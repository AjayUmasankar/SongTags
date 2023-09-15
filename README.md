# Stack
## Backend API
* built on Python 3.10.0 and FastAPI,
* hosted on Railway,
* and uses ~~MongoDB Atlas~~ Supabase's Postgres database!

## Chrome Extension
Created with TypeScript, Sass, Babel, and Webpack!


# Local Development Quickstart
## Prerequisites
NodeJS 18.15.0 
Python 3.10

## Environment Variables Setup
First, setup environment variables in a .env file and place it in `backend/database/.env`
```
CONNECTION_STRING="postgres://postgres:<PASSWORD>@db.rsirtgzvfzdoakaajals.supabase.co:6543/postgres"
```


## Host Local Backend AND Watch Extension
```
cd /frontend/
npm run setup
npm start
```
The backend will start up and any code changes will be reflected immediately on file save!
The extension will be compiled and any code changes will recompile immediately on file save! 

On first start, load this extension on chrome by choosing Load Unpacked and pointing to the `extension/dist` folder
Note: Each time it gets recompiled, it will need to be refreshed on the extensions page!



# All done!

