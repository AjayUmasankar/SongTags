from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time
import sys

# from routes.tags_router import tags_router
# from routes.user_router import user_router

# from backend.routes import tags_router
# from backend.routes import user_router

from routes import user_router
from routes import tags_router

# import tags_router
# import user_router

# Without this, we cant use print to print our dicts, it will complain about some
# UnicodeEncodeError: 'charmap' codec can't encode characters in position 170-171: character maps to <undefined> 
sys.stdout.reconfigure(encoding='utf-8') 



# FastAPI app that handles routes for us
app = FastAPI()
app.include_router(user_router.router)
app.include_router(tags_router.router)

# Setup CORS
# this is needed as we are recieving a request from youtube.com origin to our backend
# the backend needs to say that it will accept requests from that verified origi
# This is a list of URLs that will be authorized to connect to our backend
corsOrigins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://127.0.0.1:8000",
    "https://www.youtube.com",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=corsOrigins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# This is called at the start of every request
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    # await getUserDict("ajay")
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
    
