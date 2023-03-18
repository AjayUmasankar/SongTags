from pydantic import BaseModel, Field
from bson import ObjectId

from models.tags import HrefToTagsDict

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
    hrefs: HrefToTagsDict    #hrefs: dict[str, dict[str, dict[str, str]]] also works
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