import collections
import re

from fastapi import APIRouter

from models.tags import Tag, TagDict
import database.database as db     



# will automatically create keys that dont exist
def nesteddict():
    return collections.defaultdict(nesteddict)

router = APIRouter(
    prefix="/tags",
    tags=["tags"],
    responses={404: {"description": "Not found"}},
)

@router.get("/{user_email}", description="Get all tags that match a search term")
async def get_matching_tags(user_email:str, term:str):
    print(user_email)
    return await db.get_matching_tags(user_email, term)


@router.get("/{user_email}/{song_id}", description="Returns a list of tags for the specified song", response_model=TagDict)
async def get_all_song_tags(user_email:str, song_id: str, song_name:str, playlist_id:str,  playlist_name:str, uploader:str):
    await db.set_default_user(user_email)
    await db.set_default_song(song_id, song_name, uploader)
    await db.set_default_playlist(playlist_id, playlist_name, user_email)
    await db.set_default_playlist_song(playlist_id, song_id)
    if(re.search("^p[0-9]+", playlist_name, re.IGNORECASE)):
        await set_automated_tags(user_email, song_id, song_name, playlist_name, uploader)

    tags = await db.get_all_song_tags(user_email, song_id)
    return tags

# @router.post("/{username}/{song_id}", description="Sets the list of tags for the song", response_description="Tags successfully set")
# async def set_tags(username:str, song_id: str, request: Request):
#     tagsString: str = await request.json() 
#     tags = json.loads(tagsString)
#     print(tags)
#     for tag_name, tag_info in tags.items():
#         await db.set_tag(username, song_id, tag_name, tag_info)
#     return JSONResponse(status_code=status.HTTP_201_CREATED, content=tags)

@router.post("/{user_email}/{song_id}/{tag_name}", description="Creates tag in database, or upserts if it exists", response_model=Tag)
async def set_tag(user_email:str, song_id: str, tag_name: str):
    tag = await db.set_tag(user_email, song_id, tag_name)
    return tag

@router.delete("/{user_email}/{song_id}/{tag_name}", description="Deletes tag in database if it exists", response_model=Tag)
async def delete_tag(user_email:str, song_id: str, tag_name: str):
    tag = await db.delete_tag(user_email, song_id, tag_name)
    return tag




async def set_automated_tags(user_email: str, song_id: str, song_name:str, playlist_name:str, uploader:str):

    async def automate_tag(search_string:str, tag_name:str, tag_type:str, tag_pattern:str, case_sensitive:bool, is_artist:bool = False):
        nonlocal found_artist
        found_artist = is_artist
        flags = re.MULTILINE if case_sensitive else re.IGNORECASE   # the MULTILINE is a placeholder for re.NOFLAG which only exists in python 3.11 :(

        if re.search(tag_pattern, search_string, flags):
            print(f"adding tag:  {tag_name} for {song_id}" )
            await db.set_tag(user_email,song_id,tag_name, { "type": tag_type, "priority": 500})
            # automated_tags[tag_name]["type"] = tag_type

    async def automate_tag_match(song_name:str, match_group:int, tag_type:str, tag_pattern:str, case_sensitive:bool, is_artist:bool = False):
        nonlocal found_artist
        found_artist = is_artist
        flags = re.MULTILINE if case_sensitive else re.IGNORECASE
        # print(f"checking {tag_pattern} in {song_name}" )

        if (result := re.search(tag_pattern, song_name, flags)):   # Walrus operator. result gets assigned the value and search is successful
            await db.set_tag(user_email,song_id,result.group(match_group), { "type": tag_type, "priority": 500})
            # automated_tags[result.group(match_group)]["type"] = tag_type

    await db.set_tag(user_email, song_id, playlist_name, { "type": "playlist", "priority": 100 })
    # await db.set_tag(user_email,song_id,"Automated", { "type": "metadata", "priority": 500})

    found_artist = False
    ############## Automations based on Song Name ##############
    # Vocaloids 
    await automate_tag(song_name, "ミク", "vocaloid", "Miku|ミク|レン", False)
    await automate_tag(song_name, "レン", "vocaloid", "レン", False)
    await automate_tag(song_name, "可不", "vocaloid", "Kafu|可不", False)
    await automate_tag(song_name, "Slave.V-V-R", "vocaloid", "Slave\.V-V-R", False, True)
    await automate_tag(song_name, "IA", "vocaloid", " IA", False)

    # Games
    await automate_tag_match(song_name, 1, "game", r"(Blue Archive|CounterSide|Lost Ark|Arknights)", False, True)
    await automate_tag(song_name, "Persona 5", "game", "(P5|P5R|Persona 5)", False, True)
    await automate_tag(song_name, "Honkai Impact 3rd", "game", "(HI3|Honkai Impact 3|Houkai Impact 3)", False, True)
    await automate_tag(song_name, "Danganronpa", "game", "(Danganronpa|Danganronpa 2|SDR2|Danganronpa V3|Danganronpa 3)", False, True)

    # Anime
    await automate_tag_match(song_name, 1, "anime", r"(Bleach|Gintama|Link Click)", False, True)

    # Other categories
    await automate_tag_match(song_name, 1, "artist", "(usao|dj noriken|ko3|Massive New Krew|REDALiCE|Laur|kors k|Srav3R|aran|Hommarju|DJ Genki|DJ Myosuke|t\\+pazolite|RoughSketch|Kobaryo|P\\*Light|nora2r|Relect|Getty|Tatsunoshin)", False, True)
    await automate_tag(song_name, "Tano*C", "genre", "usao|dj noriken|ko3|Massive New Krew|REDALiCE|Laur|kors k|Srav3R|aran|Hommarju|DJ Genki|DJ Myosuke|t\\+pazolite|RoughSketch|Kobaryo|P\\*Light|nora2r|Relect|Getty|Tatsunoshin", False)
    await automate_tag(song_name, "東方", "genre", "東方|Touhou", False)
    await automate_tag(song_name, "Nightcore", "genre", "nightcore", False)
    await automate_tag(song_name, "S3RL", "genre", "Atef|S3RL", True)
    await automate_tag(song_name, "OMFG", "genre", "OMFG", True)


    ############ Automations based on Playlist Name ###################
    await automate_tag(playlist_name, "OST", "category", "Game/TV/Movie OST", False)
    await automate_tag(playlist_name, "ᛄᛄᛄᛄᛄ", "category", "^Classics$", False)


    ############ Automations to find artist ###################
    if found_artist: 
        return
    
    if re.search(" - Topic", uploader, re.IGNORECASE):
        await db.set_tag(user_email, song_id, uploader.removesuffix(' - Topic'), { "type": "artist", "priority": 500})

    if result := re.search("(.*?) Official", uploader, re.IGNORECASE):
        await db.set_tag(user_email, song_id, result.group(1), { "type": "artist", "priority": 500})

    # uploader name exists in song name
    if re.search(uploader, song_name, re.IGNORECASE):
        await db.set_tag(user_email, song_id, uploader, { "type": "artist", "priority": 500})

    if result := re.search("(.*?)ちゃんねる", uploader, re.IGNORECASE):
        await db.set_tag(user_email, song_id, result.group(1), { "type": "artist", "priority": 500})

    # # desperation by removing slash
    # if result := re.search("(.*?) \/", uploader, re.IGNORECASE):
    #     automatedTags[result.group(1)]["type"] = "artist"   

    # # desperation by removing - 
    # if result := re.search("(.*?) -.*", uploader, re.IGNORECASE):
    #     automatedTags[result.group(1)]["type"] = "artist"   
    
    # # Add uploader name as a tag
    # tagsToAdd.set(uploader, new TagData("uploader"));


