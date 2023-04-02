from pydantic import BaseModel

class Tag(BaseModel):
    name: str
    type: str
    priority: int

class TagDict(BaseModel):
    __root__: dict[str, Tag]

# Apparantly this is the same as TagDict .........
class TagsToTagInfoDict(BaseModel):
    # __root__: dict[str, Tag]
    __root__: dict[str, dict[str, str]]

    # whether to allow arbitrary user types for fields (they are validated simply by checking if the value is an instance of the type).
    # an arbitrary user type doesnt inherit from pydantic BaseModel
    class Config:
        arbitrary_types_allowed: True 


class HrefToTagsDict(BaseModel):
    __root__: dict[str, TagsToTagInfoDict]

    class Config:
        arbitrary_types_allowed: True