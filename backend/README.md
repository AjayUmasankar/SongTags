# Backend Server setup
## Local - Hosted at http://127.0.0.1:8000
```
cd ../extension/
npm run startbackend
```

## Railway Setup - Hosted at db.rsirtgzvfzdoakaajals.supabase.co:6543
Build Command - `pip install -r requirements.txt`
Start Command - `uvicorn main:app --host 0.0.0.0 --port $PORT`
Environment Variables
* CONNECTION_STRING = "postgres://postgres:<PASSWORD>@db.rsirtgzvfzdoakaajals.supabase.co:6543/postgres" 
* NIXPACKS_PYTHON_VERSION = 3.10
* PORT = 5000

# Development 
Choose python interpreter (CTRL SHIFT P) to the one in your virtual environment (backend/.venv) or else there will be many 'import not resolved' warnings


