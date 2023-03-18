from bson.json_util import dumps, loads # from json import dumps, loads
from pydantic import BaseSettings
import motor.motor_asyncio


# Used for reading in enviroment variables from .env / heroku
class Settings(BaseSettings):
    database_url: str = "mongodb://localhost:27017"

    class Config:
        env_file = "database/.env"

settings = Settings()

# MongoDB Atlas connection setup 
client = motor.motor_asyncio.AsyncIOMotorClient(settings.database_url)
db = client.songtags
songTagsCol = db["songtags"] 
print(db)
print(songTagsCol)


async def get_user_information(username: str):
    return await songTagsCol.find_one({"username": username}, {'_id': 0})

async def get_user_dict(username: str):
    userDict = {}
    user = await songTagsCol.find_one({"username": username})
    # to serialize bson document to a json formatted string
    userJson = dumps(user)
    # to deseralize json and create a python object 
    userDict = loads(userJson)
    return userDict

async def set_tags(username: str, href: str, tags: dict):
    # tags = nested_dict()
    usertoupdate = { "username" : username }
    hreftochange = "hrefs." + href
    newvalues = { "$set": {  hreftochange : tags } }
    songTagsCol.update_one( usertoupdate, newvalues, upsert=True)

