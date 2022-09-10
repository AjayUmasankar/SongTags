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



# FastAPI app that handles routes for us
app = FastAPI()
setupCors(app)

# MongoDB Atlas connection setup 
client = motor.motor_asyncio.AsyncIOMotorClient(settings.database_url)
db = client.songtags
songTagsCol = db["songtags"] 


# this is needed as we are recieving a request from youtube.com origin to our backend
# the backend needs to say that it will accept requests from that verified origin


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




class UserModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    username: str = Field(...)
    hrefs: dict[str, list[str]] 

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra =  {
            "_id": {
                "$oid": "62fc7d0e1bc9453e6a6424d6"
            },
            "hrefs": {
                "KmDQuwJWs84": [
                    "nightcore",
                    "usao",
                    "crazybeat"
                ],
                "testHref": [
                    "testtag"
                ]
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


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    await getUserDict("ajay")
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
    

@app.get("/user/{username}", description="Returns the user and all of their tags", response_model=UserModel)
async def getUser(username: str):
    return await songTagsCol.find_one({"username": username}, {'_id': 0})
    return userDict
    return await getUserDict(username)
#     raise HTTPException(status_code=404, detail=f"Student {id} not found")


@app.get("/tags/{username}/{href}", description="Returns a list of tags for the specified song", response_model=List[str])
async def getTags(username:str, href: str, request: Request):
    # print(request.headers)
    hrefs = userDict["hrefs"]
    tags = []
    if href in [*hrefs]:
        tags = userDict["hrefs"][href]
    #pprint.pprint(tags)
    return tags


@app.post("/tags/{username}/{href}", description="Sets the list of tags for the song", response_description="Tag successfully added")
async def setTags(username:str, href: str, request: Request):
    # print(request.headers)
    tags = await request.json() # gets the body
    print(tags)
    hrefs = (userDict["hrefs"]) # is a dictionary
    if href not in [*hrefs]:
        userDict['hrefs'][href] = []
    else:
        userDict['hrefs'][href] = tags

    usertoupdate = { "username" : username }
    newvalues = { "$set": 
        { 
            "hrefs": { href: tags }
        },
    }

    hreftochange = "hrefs." + href
    newvalues = { "$set": {  hreftochange : tags } }

    songTagsCol.update_one( usertoupdate, newvalues, upsert=True)
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=tags)

# http://127.0.0.1:8000/addtag/ajay/testHref/testtag
# @app.post("/tags/{username}/{href}/{tag}", description="Adds a single tag to a song", response_description="Tag successfully added")
# async def addTag(username:str, href: str, tag: str):
    # userDict = await getUserDict(username); # songTagsCol.find_one({"username": username})
    # hrefs = (userDict["hrefs"]) # is a dictionary
    # if href not in [*hrefs]:
    #     userDict['hrefs'][href] = []
    # tags = hrefs[href]
    # if tag not in tags:
    #     tags.append(tag)

    # usertoupdate = { "username" : username }
    # newvalues = { "$set": { "hrefs": { href: tags } }}

    # songTagsCol.update_one(usertoupdate, newvalues)
    # return JSONResponse(status_code=status.HTTP_201_CREATED, content=tags)


