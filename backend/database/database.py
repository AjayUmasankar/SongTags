from pydantic import BaseSettings

import psycopg2
import psycopg2.extras


# Used for reading in enviroment variables from .env 
class Settings(BaseSettings):
    database_url: str = "mongodb://localhost:27017"
    connection_string: str = "nope"

    class Config:
        env_file = "database/.env"

settings = Settings()

conn = psycopg2.connect(settings.connection_string)

# This cursor keeps column names when fetching values
cursor = conn.cursor(cursor_factory=psycopg2.extras.NamedTupleCursor)

async def get_user(user_email: str):
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
async def get_song(song_id: str, song_name: str):
    cursor.execute("SELECT COUNT(*) FROM public.song WHERE song_id = %s", (song_id,))
    song_exists = cursor.fetchone()[0]

    if not song_exists:
        cursor.execute("INSERT INTO public.song (song_id, name) VALUES (%s, %s) RETURNING song_id, name", (song_id, song_name,))
        conn.commit()
    else:
        cursor.execute("SELECT * FROM public.song WHERE song_id = %s", (song_id,))

    inserted_row = cursor.fetchone()
    return inserted_row
async def get_playlist(playlist_id: str, playlist_name: str):
    cursor.execute("SELECT COUNT(*) FROM public.playlist WHERE playlist_id = %s", (playlist_id,))
    playlist_exists = cursor.fetchone()[0]

    if not playlist_exists:
        cursor.execute("INSERT INTO public.playlist (playlist_id, name, user_id) VALUES (%s, %s, %s) RETURNING playlist_id, name, user_id", (playlist_id, playlist_name,))
        conn.commit()
    else:
        cursor.execute("SELECT * FROM public.playlist WHERE playlist_id = %s", (playlist_id,))


async def get_tags(user_email: str, song_id: str):
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
                   (user_email, song_id, tag_name, tag_info['type'], tag_info['priority'],)) 
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
    return row