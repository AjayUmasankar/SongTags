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
user_collection = db["songtags"]  # should try to rename the collection from songtags to users
print(db)


async def get_user_document(username: str):
    user = await user_collection.find_one({"username": username})
    # to serialize bson document to a json formatted string
    user_json = dumps(user)
    # to deseralize json and create a python object 
    user_dict = loads(user_json)
    return user_dict

async def set_tags(username: str, href: str, tags: dict):
    # tags = nested_dict()
    usertoupdate = { "username" : username }
    hreftochange = "hrefs." + href
    newvalues = { "$set": {  hreftochange : tags } }
    user_collection.update_one(usertoupdate, newvalues, upsert=True)

