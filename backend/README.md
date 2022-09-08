Created with FastAPI, Deta, and MongoDB!
# To host this backend locally
```bash
# Install the requirements in a virtual env:
py -m venv .venv
.\\.venv\Scripts\activate       # deactivate to stop using venv
pip install -r requirements.txt

# Start the service:
uvicorn app:app --reload
```
Now you can load http://localhost:8000/docs in your browser

# To deploy this backend code to Deta
You will need a version of python supported by Deta. Then, install Deta
```
deta login
```

