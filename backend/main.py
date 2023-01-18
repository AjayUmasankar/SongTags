from fastapi import FastAPI, status, Request
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel, Field
from bson import ObjectId
from bson.json_util import dumps, loads
from typing import List
from config import settings, setupCors # stores environment variables
import motor.motor_asyncio
import time
import collections
import re
from typing import Optional
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


class TagsToTagInfoDict(BaseModel):
    # __root__: dict[str, Tag]
    __root__: dict[str, dict[str, str]]

    class Config:
        arbitrary_types_allowed: True


class HrefToTagsDict(BaseModel):
    __root__: dict[str, TagsToTagInfoDict]

    class Config:
        arbitrary_types_allowed: True

class UserModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    username: str = Field(...)
    hrefs: HrefToTagsDict
    #hrefs: dict[str, dict[str, dict[str, str]]] also works
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


@app.get("/user/{username}", description="Returns the user and all of their tags", response_model=UserModel)
async def getUser(username: str):
    return await songTagsCol.find_one({"username": username}, {'_id': 0})
#     raise HTTPException(status_code=404, detail=f"Student {id} not found")





@app.get("/tags/{username}/{href}", description="Returns a list of tags for the specified song", response_model=TagsToTagInfoDict)
async def getTags(username:str, href: str, uploader:str, songname:str, playlistName:str, request: Request):
    hrefs = userDict.get("hrefs")
    tags = nested_dict()
    if hrefs is None:
        print ("The userDict object has no propery hrefs")
        return; 
    
    if href in [*hrefs]:
        tags = mergeDict(userDict["hrefs"][href], getAutomatedTags(uploader, songname, playlistName))
        await setTags (username, href, tags)
        # print(getAutomatedTags(uploader, songname, playlistName))
    else:
        tags = getAutomatedTags(uploader, songname, playlistName)
        await setTags (username, href, tags)

    return tags

# Dict1 values take priority and will overrule dic2
def mergeDict(dict1, dict2):
    result = nested_dict()
    for key, value in dict2.items():
        result[key] = value 
    for key, value in dict1.items():
        result[key] = value 
    return result

def nested_dict():
    return collections.defaultdict(nested_dict)


def getAutomatedTags(uploader:str, songName:str, playlistName:str):
    artistFound = False
    automatedTags = nested_dict() # will automatically create keys that dont exist
    automatedTags["THISISAUTOMATED"] = {
        "type": "metadata"
    }

    def automateTag(input:str, tagName:str, tagType:str, tagPattern:str, tagNameIsArtist:bool = False):
        nonlocal artistFound, automatedTags
        artistFound = tagNameIsArtist
        if re.search(tagPattern, input, re.IGNORECASE):
            automatedTags[tagName]["type"] = tagType

    def automateTagMatch(input:str, matchGroup:int, tagType:str, tagPattern:str, tagNameIsArtist:bool = False):
        nonlocal artistFound, automatedTags
        artistFound = tagNameIsArtist
        if result := re.search(tagPattern, input, re.IGNORECASE):
            automatedTags[result.group(matchGroup)]["type"] = tagType



    ############## Automations based on Song Name ##############
    # Vocaloids 
    automateTag(songName, "ミク", "vocaloid", "Miku|ミク")
    automateTag(songName, "可不", "vocaloid", "Kafu|可不")
    automateTag(songName, "Slave.V-V-R", "vocaloid", "Slave\.V-V-R", True)
    automateTag(songName, "IA", "vocaloid", " IA")

    # Games
    automateTagMatch(songName, 1, "game", r"(Blue Archive|Counterside|Lost Ark|Arknights)", True)
    automateTag(songName, "Persona 5", "game", "(P5|P5R|Persona 5)", True)
    automateTag(songName, "Honkai Impact 3rd", "game", "(HI3|Honkai Impact 3|Houkai Impact 3)", True)
    automateTag(songName, "Danganronpa", "game", "(Danganronpa|Danganronpa 2|SDR2|Danganronpa V3|Danganronpa 3)", True)

    # Anime
    automateTagMatch(songName, 1, "anime", r"(Bleach|Gintama|Link Click)", True)

    # Other categories
    automateTag(songName, "Tano*C", "genre", "usao|dj noriken|ko3|Massive New Krew|REDALiCE|Laur|kors k|Srav3R|aran|Hommarju|DJ Genki|DJ Myosuke|t\\+pazolite|RoughSketch|Kobaryo|P\\*Light|nora2r|Relect|Getty|Tatsunoshin")
    automateTag(songName, "東方", "genre", "東方|Touhou")
    automateTag(songName, "Nightcore", "genre", "nightcore")
    automateTag(songName, "S3RL", "genre", "Atef|S3RL")


    ############ Automations based on Playlist Name ###################
    automateTag(playlistName, "OST", "category", "Game/TV/Movie OST")
    automateTag(playlistName, "ᛄᛄᛄᛄᛄ", "category", "^Classics$")


    ############ Automations to find artist ###################
    if (artistFound): 
        return automatedTags

    if re.search(" - Topic", uploader, re.IGNORECASE):
        automatedTags[uploader.removesuffix(' - Topic')]["type"] = "artist"

    if result := re.search("(.*?) Official", uploader, re.IGNORECASE):
        automatedTags[result.group(1)]["type"] = "artist"

    # uploader name exists in song name
    if re.search(uploader, songName, re.IGNORECASE):
        automatedTags[uploader]["type"] = "artist"

    if result := re.search("(.*?)ちゃんねる", uploader, re.IGNORECASE):
        automatedTags[result.group(1)]["type"] = "artist"

    # # desperation by removing slash
    # if result := re.search("(.*?) \/", uploader, re.IGNORECASE):
    #     automatedTags[result.group(1)]["type"] = "artist"   

    # # desperation by removing - 
    # if result := re.search("(.*?) -.*", uploader, re.IGNORECASE):
    #     automatedTags[result.group(1)]["type"] = "artist"   
    
    # # Add uploader name as a tag
    # tagsToAdd.set(uploader, new TagData("uploader"));

    return automatedTags



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






