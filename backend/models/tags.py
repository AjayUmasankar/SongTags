from pydantic import BaseModel

class TagsToTagInfoDict(BaseModel):
    # __root__: dict[str, Tag]
    __root__: dict[str, dict[str, str]]

    class Config:
        arbitrary_types_allowed: True


class HrefToTagsDict(BaseModel):
    __root__: dict[str, TagsToTagInfoDict]

    class Config:
        arbitrary_types_allowed: True