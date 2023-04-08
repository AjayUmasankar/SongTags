from pydantic import BaseSettings

import psycopg2
import psycopg2.extras


# Used for reading in enviroment variables from .env 
class Settings(BaseSettings):
    connection_string: str = "postgres://postgres:<PASSWORD>@db.rsirtgzvfzdoakaajals.supabase.co:6543/postgres"

    class Config:
        env_file = "database/.env"

settings = Settings()
conn = psycopg2.connect(settings.connection_string)

# This cursor keeps column names when fetching values
cursor = conn.cursor(cursor_factory=psycopg2.extras.NamedTupleCursor)


async def get_matching_tags(user_email: str, term: str):
    # cursor.execute("SELECT UNIQUE(tag_type) FROM public.usertag WHERE user_email = %s", (user_email),)
    # cursor.execute("SELECT * FROM public.usertag WHERE user_email = %s ", (user_email,))
    term = term.lower()
    cursor.execute( f"SELECT DISTINCT tag_name, type, priority " +
                    f"FROM public.usersongtag WHERE user_email = %s " +
                    f"AND LOWER(tag_name) LIKE %s", 
                    (user_email,f'%{term}%',)
    )

    tags_by_type = {}
    for row in cursor.fetchall():
        if(row.type not in tags_by_type):
            tags_by_type[row.type] = []

        tags_by_type[row.type].append({
            "id": row.tag_name,
            "text": row.tag_name
        })

    tags_for_select2 = { "results": [] }
    for row_type in tags_by_type:
        tags_for_select2["results"].append({
            "text": row_type,
            "children": tags_by_type[row_type]
        })
    return tags_for_select2

async def get_all_song_tags(user_email: str, song_id: str):
    cursor.execute("SELECT * FROM public.usersongtag WHERE user_email = %s and song_id = %s", (user_email, song_id,))
    tags = {}
    for row in cursor.fetchall():
        tags[row.tag_name] = {
            "name": row.tag_name,
            "type": row.type,
            "priority": row.priority
        }
    return tags

async def set_tag(user_email: str, song_id: str, tag_name: str, tag_info: dict = {"type": "normal", "priority": 500}):
    cursor.execute(f"INSERT INTO public.usersongtag (user_email, song_id, tag_name, type, priority) VALUES (%s, %s, %s, %s, %s) " +
                   f"ON CONFLICT ON CONSTRAINT usersongtag_pkey DO UPDATE SET type = EXCLUDED.type, priority = EXCLUDED.priority " +
                   f"RETURNING *", 
                   (user_email, song_id, tag_name, tag_info['type'], tag_info['priority'],)
    ) 
    row = cursor.fetchone()
    conn.commit()
    return { "name": row.tag_name, "type": row.type, "priority": row.priority } 
    
async def delete_tag(user_email: str, song_id: str, tag_name: str):
    cursor.execute(f"DELETE FROM public.usersongtag " +
                   f"WHERE user_email = %s AND song_id = %s AND tag_name = %s " +
                   f"RETURNING *",
                   (user_email, song_id, tag_name,))
    row = cursor.fetchone()
    conn.commit()
    return { "name": row.tag_name, "type": row.type, "priority": row.priority } 





#  Probably need to refactor these....
async def set_default_user(user_email: str):
    # Check if the user already exists in the database
    cursor.execute('SELECT COUNT(*) FROM public.user WHERE email = (%s)', (user_email,))
    user_exists = cursor.fetchone()[0]

    # If the user doesn't exist, insert them into the database
    if not user_exists:
        cursor.execute("INSERT INTO public.user (email) VALUES (%s) RETURNING email, name", (user_email,))
        conn.commit()
    else:
        cursor.execute("SELECT * FROM public.user WHERE email = (%s)", (user_email,))

    inserted_row = cursor.fetchone()
    return inserted_row

async def set_default_song(song_id: str, song_name: str, uploader: str):
    cursor.execute(f"INSERT INTO public.song (song_id, name, uploader) VALUES (%s, %s, %s) " +
                   f"ON CONFLICT ON CONSTRAINT song_pkey DO UPDATE SET name = EXCLUDED.name, uploader = EXCLUDED.uploader " +
                   f"RETURNING song_id, name, uploader", 
                    (song_id, song_name, uploader,))
    conn.commit()

async def set_default_playlist(playlist_id: str, playlist_name: str, user_email: str):
    cursor.execute(f"INSERT INTO public.playlist (playlist_id, name, user_email) VALUES (%s, %s, %s) " +
                    f"ON CONFLICT ON CONSTRAINT playlist_pkey DO UPDATE SET name = EXCLUDED.name, user_email = EXCLUDED.user_email " +
                    f"RETURNING playlist_id, name, user_email",
                    (playlist_id, playlist_name, user_email,))
    conn.commit()

async def set_default_playlist_song(playlist_id: str, song_id: str):
    cursor.execute(f"INSERT INTO public.playlistsong (playlist_id, song_id) VALUES (%s, %s) " +
                   f"ON CONFLICT ON CONSTRAINT playlistsong_pkey DO NOTHING " +
                   f"RETURNING playlist_id, song_id", 
                    (playlist_id, song_id,))
    conn.commit()