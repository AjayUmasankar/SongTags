Created with FastAPI, Heroku, and MongoDB Atlas!

# Quickstart Backend Server 
## Local - Hosted at http://127.0.0.1:8000
```
cd ../frontend/
npm run startbackend
```

## Railway
Build Command - `pip install -r requirements.txt`
Start Command - `uvicorn main:app --host 0.0.0.0 --port $PORT`
Environment Variables
* DATABASE_URL
* NIXPACKS_PYTHON_VERSION = 3.10
* PORT = 5000

# Development 
Choose python interpreter (CTRL SHIFT P) to the one in your virtual environment or else there will be many 'import not resolved' warnings


