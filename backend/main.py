from fastapi import FastAPI, status, Request
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel, Field
from bson import ObjectId
from bson.json_util import dumps, loads
from typing import List
from config import settings, setupCors # stores environment variables
import motor.motor_asyncio
import pprint
import time
import requests
import collections
import re
from typing import Optional
import json
import sys

# Without this, we cant use print to print our dicts, it will complain about some
# UnicodeEncodeError: 'charmap' codec can't encode characters in position 170-171: character maps to <undefined> 
sys.stdout.reconfigure(encoding='utf-8') 




# FastAPI app that handles routes for us
app = FastAPI()
setupCors(app)

# MongoDB Atlas connection setup 
client = motor.motor_asyncio.AsyncIOMotorClient(settings.database_url)
db = client.songtags
songTagsCol = db["songtags"] 


# This is called at the start of every request
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    await getUserDict("ajay")
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
    

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")



class Tag(BaseModel):
    type: str = Field(...)

    class Config:
        arbitrary_types_allowed: True

class TagDict(BaseModel):
    __root__: dict[str, Tag]

    class Config:
        arbitrary_types_allowed: True
        schema_extra = {
            "tag1": {
                "type": "tagtype1"
            },
            "Nightcore": {
                "type": "category"
            },
            "ミク": {
                "type": "vocaloid"
            }
        }

class UserModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    username: str = Field(...)
    # hrefs: dict[str, TagDict] 
    hrefs: dict[str, dict[str, Tag]]
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra =  {
            "_id": {
                "$oid": "62fc7d0e1bc9453e6a6424d6"
            },
            "hrefs": {
                "KmDQuwJWs84": {
                    "ztrot": {"type": "uploader"},
                    "nightcore": {"type": "category"}
                },
                "cyWg_kuLmMA": {
                    "USAO": {"type": "artist"},
                    "INPLAYLIST": {"type": "metadata", "result": "false"}

                },
            },
            "username": "bjay"
        }


userDict = {}
async def getUserDict(username: str):
    global userDict
    user = await songTagsCol.find_one({"username": username})
    # to serialize bson document to a json formatted string
    userJson = dumps(user)
    # to deseralize json and create a python object 
    userDict = loads(userJson)


# @app.get("/user/{username}", description="Returns the user and all of their tags", response_model=UserModel)
# async def getUser(username: str):
#     return await songTagsCol.find_one({"username": username}, {'_id': 0})
# #     raise HTTPException(status_code=404, detail=f"Student {id} not found")


@app.get("/tags/{username}/{href}", description="Returns a list of tags for the specified song", response_model=TagDict)
async def getTags(username:str, href: str, uploader:str, songname:str, playlistName:str, request: Request):
    hrefs = userDict.get("hrefs")
    tags = nested_dict()
    if hrefs is None:
        print ("The userDict object has no propery hrefs")
        return; 
    
    if href in [*hrefs]:
        tags = mergeDict(userDict["hrefs"][href], getAutomatedTags(uploader, songname, playlistName))
        # tags.update
        print(tags)
        print(getAutomatedTags(uploader, songname, playlistName))
    else:
        tags = getAutomatedTags(uploader, songname, playlistName)
        await setTags (username, href, tags)

    # if(isinstance(tags, list)):
    #     print("this one is still a list")
    #     newmap = {}
    #     for tag in tags:
    #         newmap[tag] = { "type": "default" }
    #     tags = newmap
    return tags

# Dict1 values take priority and will overrule dic2
def mergeDict(dict1, dict2):
    input_dicts = [dict1, dict2]
    result = nested_dict()
    for key, value in dict2.items():
        result[key] = value 
    for key, value in dict1.items():
        result[key] = value 
    return result

def nested_dict():
    return collections.defaultdict(nested_dict)


def getAutomatedTags(uploader:str, songname:str, playlistName:str):
    automatedTags = nested_dict() # will automatically create keys that dont exist

    automatedTags[uploader] = {
        "type": "uploader"
    }
    automatedTags["AUTOMATED"] = {
        "type": "metadata"
    }
    automatedTags["fromautomationnotype"] = {
        "type": "notype"
    }

    pattern = "nightcore"
    if re.search(pattern, songname, re.IGNORECASE):
        automatedTags["Nightcore"]["type"] = "category"
        # addTagToDict(automatedTags, "Nightcore")
    pattern = "usao|dj noriken|ko3|Massive New Krew|REDALiCE|Laur|kors k|Srav3R|aran|Hommarju|DJ Genki|DJ Myosuke|t\\+pazolite|RoughSketch|Kobaryo|P\\*Light|nora2r|Relect|Getty|Tatsunoshin"
    if re.search(pattern, songname, re.IGNORECASE):
        automatedTags["Tano*C"]["type"] = "category"
    pattern = "東方|Touhou"
    if re.search(pattern, songname, re.IGNORECASE):
        automatedTags["東方"]["type"] = "category"
    return automatedTags

# def addTagToDict(tags:dict, tagName:str, tagType:str):
#     tags[tagName]["type"] = tagType

@app.post("/tags/{username}/{href}", description="Sets the list of tags for the song", response_description="Tags successfully set")
async def setTags(username:str, href: str, request: Request):
    tags = await request.json() # gets the body
    await setTags(username, href, tags)
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=tags)

async def setTags(username:str, href:str, tags:dict):
    usertoupdate = { "username" : username }
    hreftochange = "hrefs." + href
    newvalues = { "$set": {  hreftochange : tags } }
    songTagsCol.update_one( usertoupdate, newvalues, upsert=True)
