from pydantic import BaseSettings
from fastapi.middleware.cors import CORSMiddleware


# Used for reading in enviroment variables from .env / heroku
class Settings(BaseSettings):
    database_url: str = "mongodb://localhost:27017"

    class Config:
        env_file = ".env"

settings = Settings()

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

def setupCors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=corsOrigins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
