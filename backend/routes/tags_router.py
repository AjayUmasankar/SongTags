import collections
import re
# from requests import Request

# from json import dumps, loads
from fastapi import APIRouter, status, Request
from fastapi.responses import JSONResponse

from models.tags import TagsToTagInfoDict
# from ..models.tags import TagsToTagInfoDict

# from database.database import db
import database.database as db



router = APIRouter(
    prefix="/tags",
    tags=["tags"],
    # responses={404: {"description": "Not found"}},
)

# will automatically create keys that dont exist
def nesteddict():
    return collections.defaultdict(nesteddict)



@router.get("/{username}/{href}", description="Returns a list of tags for the specified song", response_model=TagsToTagInfoDict)
async def get_tags(username:str, href: str, uploader:str, songname:str, playlistName:str, request: Request):
    userDict = await db.get_user_dict(username)
    hrefs = userDict.get("hrefs") 
    tags = nesteddict()
    if hrefs is None:
        print ("The userDict object has no propery hrefs")
        return; 
    
    if href in [*hrefs]:
        tags = merge_dict(userDict["hrefs"][href], get_automated_tags(uploader, songname, playlistName))
        await set_tags (username, href, tags)
    else:
        tags = get_automated_tags(uploader, songname, playlistName)
        await set_tags (username, href, tags)

    return tags


async def set_tags(username:str, href:str, tags:dict):
    db.setTags(username, href, tags)



@router.post("/tags/{username}/{href}", description="Sets the list of tags for the song", response_description="Tags successfully set")
async def set_tags(username:str, href: str, request: Request):
    tags = await request.json() # gets the body
    await set_tags(username, href, tags)
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=tags)





# Dict1 values take priority and will overrule dic2
def merge_dict(dict1, dict2):
    result = nesteddict()
    for key, value in dict2.items():
        result[key] = value 
    for key, value in dict1.items():
        result[key] = value 
    return result




def get_automated_tags(uploader:str, songName:str, playlistName:str):
    artistFound = False
    automatedTags = nesteddict() 
    automatedTags["THISISAUTOMATED"] = {
        "type": "metadata"
    }

    def automate_tag(input:str, tagName:str, tagType:str, tagPattern:str, tagNameIsArtist:bool = False):
        nonlocal artistFound, automatedTags
        artistFound = tagNameIsArtist
        if re.search(tagPattern, input, re.IGNORECASE):
            automatedTags[tagName]["type"] = tagType

    def automate_tag_match(input:str, matchGroup:int, tagType:str, tagPattern:str, tagNameIsArtist:bool = False):
        nonlocal artistFound, automatedTags
        artistFound = tagNameIsArtist
        if result := re.search(tagPattern, input, re.IGNORECASE):
            automatedTags[result.group(matchGroup)]["type"] = tagType



    ############## Automations based on Song Name ##############
    # Vocaloids 
    automate_tag(songName, "ミク", "vocaloid", "Miku|ミク")
    automate_tag(songName, "可不", "vocaloid", "Kafu|可不")
    automate_tag(songName, "Slave.V-V-R", "vocaloid", "Slave\.V-V-R", True)
    automate_tag(songName, "IA", "vocaloid", " IA")

    # Games
    automate_tag_match(songName, 1, "game", r"(Blue Archive|Counterside|Lost Ark|Arknights)", True)
    automate_tag(songName, "Persona 5", "game", "(P5|P5R|Persona 5)", True)
    automate_tag(songName, "Honkai Impact 3rd", "game", "(HI3|Honkai Impact 3|Houkai Impact 3)", True)
    automate_tag(songName, "Danganronpa", "game", "(Danganronpa|Danganronpa 2|SDR2|Danganronpa V3|Danganronpa 3)", True)

    # Anime
    automate_tag_match(songName, 1, "anime", r"(Bleach|Gintama|Link Click)", True)

    # Other categories
    automate_tag(songName, "Tano*C", "genre", "usao|dj noriken|ko3|Massive New Krew|REDALiCE|Laur|kors k|Srav3R|aran|Hommarju|DJ Genki|DJ Myosuke|t\\+pazolite|RoughSketch|Kobaryo|P\\*Light|nora2r|Relect|Getty|Tatsunoshin")
    automate_tag(songName, "東方", "genre", "東方|Touhou")
    automate_tag(songName, "Nightcore", "genre", "nightcore")
    automate_tag(songName, "S3RL", "genre", "Atef|S3RL")


    ############ Automations based on Playlist Name ###################
    automate_tag(playlistName, "OST", "category", "Game/TV/Movie OST")
    automate_tag(playlistName, "ᛄᛄᛄᛄᛄ", "category", "^Classics$")


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








# @router.put(
#     "/{item_id}",
#     tags=["custom"],
#     responses={403: {"description": "Operation forbidden"}},
# )
# async def update_item(item_id: str):
#     if item_id != "plumbus":
#         raise HTTPException(
#             status_code=403, detail="You can only update the item: plumbus"
#         )
#     return {"item_id": item_id, "name": "The great Plumbus"}