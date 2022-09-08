import os
from fastapi import FastAPI, Body, HTTPException, status, Request
from fastapi.responses import Response, JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId
from bson.json_util import dumps, loads
from typing import Optional, List
#import org.bson.Document
import motor.motor_asyncio
import pprint



app = FastAPI()

# client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
# db = client.local
# songTagsCol = db["usertotags"]
client = motor.motor_asyncio.AsyncIOMotorClient("mongodb+srv://ajay:Newlife1337@songtags.o5vngfj.mongodb.net/test")
db = client.songtags
songTagsCol = db["songtags"]



# this is needed as we are recieving a request from youtube.com origin to our backend
# the backend needs to say that it will accept requests from that verified origin
origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "https://www.youtube.com",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/user/{username}", description="Returns the user and his/her tag lists", response_model=UserModel)
async def getUser(username: str):
    # userm = await songTagsCol.find_one({"username": user}, {'_id': 0})
    user = await songTagsCol.find_one({"username": username})
    return user


@app.get("/tags/{username}/{href}", description="Returns a list of tags for the specified song", response_model=List[str])
async def getTags(username:str, href: str, request: Request):
    # print(request.headers)
    userDict = await getUserDict(username); # songTagsCol.find_one({"username": username})
    hrefs = userDict['hrefs']
    tags = []
    if href in [*hrefs]:
        tags = userDict["hrefs"][href]
    #pprint.pprint(tags)
    return tags


@app.post("/tags/{username}/{href}", description="Sets the list of tags for the song", response_description="Tag successfully added")
async def setTags(username:str, href: str, request: Request):
    #print(payload['tags']
    # print(request.headers)
    tags = await request.json() # gets the body
    #requestjson = request.body()
    print(tags)
    #tags = requestjson['tags']
    userDict = await getUserDict(username); 
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
    newvalues = { "$set": {  hreftochange : tags },
    }

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


async def getUserDict(username: str):
    print(songTagsCol)
    user = await songTagsCol.find_one({"username": username})
    # to serialize bson document to a json formatted string
    userJson = dumps(user)
    # to deseralize json and create a python object 
    userDict = loads(userJson)
    return userDict


# class StudentModel(BaseModel):
#     id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
#     name: str = Field(...)
#     email: EmailStr = Field(...)
#     course: str = Field(...)
#     gpa: float = Field(..., le=4.0)

#     class Config:
#         allow_population_by_field_name = True
#         arbitrary_types_allowed = True
#         json_encoders = {ObjectId: str}
#         schema_extra = {
#             "example": {
#                 "name": "Jane Doe",
#                 "email": "jdoe@example.com",
#                 "course": "Experiments, Science, and Fashion in Nanophotonics",
#                 "gpa": "3.0",
#             }
#         }


# class UpdateStudentModel(BaseModel):
#     name: Optional[str]
#     email: Optional[EmailStr]
#     course: Optional[str]
#     gpa: Optional[float]

#     class Config:
#         arbitrary_types_allowed = True
#         json_encoders = {ObjectId: str}
#         schema_extra = {
#             "example": {
#                 "name": "Jane Doe",
#                 "email": "jdoe@example.com",
#                 "course": "Experiments, Science, and Fashion in Nanophotonics",
#                 "gpa": "3.0",
#             }
#         }

# @app.get(
#     "/", response_description="List all students", response_model=List[StudentModel]
# )
# async def list_students():
#     students = await db["students"].find().to_list(1000)
#     return students


# @app.post("/", response_description="Add new student", response_model=StudentModel)
# async def create_student(student: StudentModel = Body(...)):
#     student = jsonable_encoder(student)
#     new_student = await db["students"].insert_one(student)
#     created_student = await db["students"].find_one({"_id": new_student.inserted_id})
#     return JSONResponse(status_code=status.HTTP_201_CREATED, content=created_student)




# @app.get(
#     "/{id}", response_description="Get a single student", response_model=StudentModel
# )
# async def show_student(id: str):
#     if (student := await db["students"].find_one({"_id": id})) is not None:
#         return student

#     raise HTTPException(status_code=404, detail=f"Student {id} not found")


# @app.put("/{id}", response_description="Update a student", response_model=StudentModel)
# async def update_student(id: str, student: UpdateStudentModel = Body(...)):
#     student = {k: v for k, v in student.dict().items() if v is not None}

#     if len(student) >= 1:
#         update_result = await db["students"].update_one({"_id": id}, {"$set": student})

#         if update_result.modified_count == 1:
#             if (
#                 updated_student := await db["students"].find_one({"_id": id})
#             ) is not None:
#                 return updated_student

#     if (existing_student := await db["students"].find_one({"_id": id})) is not None:
#         return existing_student

#     raise HTTPException(status_code=404, detail=f"Student {id} not found")


# @app.delete("/{id}", response_description="Delete a student")
# async def delete_student(id: str):
#     delete_result = await db["students"].delete_one({"_id": id})

#     if delete_result.deleted_count == 1:
#         return Response(status_code=status.HTTP_204_NO_CONTENT)

#     raise HTTPException(status_code=404, detail=f"Student {id} not found")
