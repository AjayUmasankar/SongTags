import collections
import re

from fastapi import APIRouter, status, Request
from fastapi.responses import JSONResponse

from models.tags import Tag, TagDict
import database.database as db     

import json



# will automatically create keys that dont exist
def nesteddict():
    return collections.defaultdict(nesteddict)

def merge_dict(dict1, dict2):
    for key, value in dict1.items():
        dict2[key] = value 
    return dict2

router = APIRouter(
    prefix="/tags",
    tags=["tags"],
    # responses={404: {"description": "Not found"}},
)

@router.get("/{user_email}/{song_id}", description="Returns a list of tags for the specified song", response_model=TagDict)
async def get_tags(user_email:str, song_id: str, uploader:str, song_name:str, playlist_name:str, playlist_id:str):
    user = await db.get_user(user_email)
    song = await db.get_song(song_id, song_name)
    playlist = await db.get_playlist(playlist_id, playlist_name)
    tags = await db.get_tags(user_email, song_id)
    return tags



@router.post("/{user_email}/{song_id}/{tag_name}", description="Creates tag in database, or upserts if it exists", response_model=Tag)
async def set_tag(user_email:str, song_id: str, tag_name: str):
    tag = await db.set_tag(user_email, song_id, tag_name)
    return tag

@router.post("/{username}/{song_id}", description="Sets the list of tags for the song", response_description="Tags successfully set")
async def set_tags(username:str, song_id: str, request: Request):
    tagsString: str = await request.json() 
    tags = json.loads(tagsString)
    print(tags)
    for tag_name, tag_info in tags.items():
        await db.set_tag(username, song_id, tag_name, tag_info)
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=tags)


@router.delete("/{user_email}/{song_id}/{tag_name}", description="Deletes tag in database if it exists", response_model=Tag)
async def delete_tag(user_email:str, song_id: str, tag_name: str):
    tag = await db.delete_tag(user_email, song_id, tag_name)
    return tag




def get_automated_tags(uploader:str, song_name:str, playlist_name:str):
    tag_priorities = {
        
    }
    def automate_tag(search_string:str, tag_name:str, tag_type:str, tag_pattern:str, case_sensitive:bool, is_artist:bool = False):
        nonlocal found_artist, automated_tags
        found_artist = is_artist
        flags = re.MULTILINE if case_sensitive else re.IGNORECASE   # the MULTILINE is a placeholder for re.NOFLAG which only exists in python 3.11 :(

        if re.search(tag_pattern, search_string, flags):
            automated_tags[tag_name]["type"] = tag_type

    def automate_tag_match(search_string:str, match_group:int, tag_type:str, tag_pattern:str, case_sensitive:bool, is_artist:bool = False):
        nonlocal found_artist, automated_tags
        found_artist = is_artist
        flags = re.MULTILINE if case_sensitive else re.IGNORECASE

        if (result := re.search(tag_pattern, search_string, flags)):   # Walrus operator. result gets assigned the value and search is successful
            automated_tags[result.group(match_group)]["type"] = tag_type

    found_artist = False
    automated_tags = nesteddict() 
    automated_tags[playlist_name] = { "type" : "playlist" }
    automated_tags["THISWASAUTOMATED"] = { "type": "metadata"  }
    
    ############## Automations based on Song Name ##############
    # Vocaloids 
    automate_tag(song_name, "ミク", "vocaloid", "Miku|ミク", False)
    automate_tag(song_name, "可不", "vocaloid", "Kafu|可不", False)
    automate_tag(song_name, "Slave.V-V-R", "vocaloid", "Slave\.V-V-R", False, True)
    automate_tag(song_name, "IA", "vocaloid", " IA", False)

    # Games
    automate_tag_match(song_name, 1, "game", r"(Blue Archive|Counterside|Lost Ark|Arknights)", False, True)
    automate_tag(song_name, "Persona 5", "game", "(P5|P5R|Persona 5)", False, True)
    automate_tag(song_name, "Honkai Impact 3rd", "game", "(HI3|Honkai Impact 3|Houkai Impact 3)", False, True)
    automate_tag(song_name, "Danganronpa", "game", "(Danganronpa|Danganronpa 2|SDR2|Danganronpa V3|Danganronpa 3)", False, True)

    # Anime
    automate_tag_match(song_name, 1, "anime", r"(Bleach|Gintama|Link Click)", False, True)

    # Other categories
    automate_tag_match(song_name, 1, "artist", "(usao|dj noriken|ko3|Massive New Krew|REDALiCE|Laur|kors k|Srav3R|aran|Hommarju|DJ Genki|DJ Myosuke|t\\+pazolite|RoughSketch|Kobaryo|P\\*Light|nora2r|Relect|Getty|Tatsunoshin)", False, True)
    automate_tag(song_name, "Tano*C", "genre", "usao|dj noriken|ko3|Massive New Krew|REDALiCE|Laur|kors k|Srav3R|aran|Hommarju|DJ Genki|DJ Myosuke|t\\+pazolite|RoughSketch|Kobaryo|P\\*Light|nora2r|Relect|Getty|Tatsunoshin", False)
    automate_tag(song_name, "東方", "genre", "東方|Touhou", False)
    automate_tag(song_name, "Nightcore", "genre", "nightcore", False)
    automate_tag(song_name, "S3RL", "genre", "Atef|S3RL", True)
    automate_tag(song_name, "OMFG", "genre", "OMFG", True)


    ############ Automations based on Playlist Name ###################
    automate_tag(playlist_name, "OST", "category", "Game/TV/Movie OST", False)
    automate_tag(playlist_name, "ᛄᛄᛄᛄᛄ", "category", "^Classics$", False)


    ############ Automations to find artist ###################
    if found_artist: 
        return automated_tags

    if re.search(" - Topic", uploader, re.IGNORECASE):
        automated_tags[uploader.removesuffix(' - Topic')]["type"] = "artist"

    if result := re.search("(.*?) Official", uploader, re.IGNORECASE):
        automated_tags[result.group(1)]["type"] = "artist"

    # uploader name exists in song name
    if re.search(uploader, song_name, re.IGNORECASE):
        automated_tags[uploader]["type"] = "artist"

    if result := re.search("(.*?)ちゃんねる", uploader, re.IGNORECASE):
        automated_tags[result.group(1)]["type"] = "artist"

    # # desperation by removing slash
    # if result := re.search("(.*?) \/", uploader, re.IGNORECASE):
    #     automatedTags[result.group(1)]["type"] = "artist"   

    # # desperation by removing - 
    # if result := re.search("(.*?) -.*", uploader, re.IGNORECASE):
    #     automatedTags[result.group(1)]["type"] = "artist"   
    
    # # Add uploader name as a tag
    # tagsToAdd.set(uploader, new TagData("uploader"));

    return automated_tags








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
