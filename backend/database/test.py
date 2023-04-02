import psycopg2

# Get the connection details from your Supabase account
supabase_url: str = "https://rsirtgzvfzdoakaajals.supabase.co"
supabase_key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzaXJ0Z3p2Znpkb2FrYWFqYWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAzNzI3MzksImV4cCI6MTk5NTk0ODczOX0.VFvx8b50y4vJSBHRuRvqWD87YpSb6gEm0WkV3TNL3pY"


# Create the connection string for psycopg2
connection_string = "postgres://postgres:Dontnotdie1337@db.rsirtgzvfzdoakaajals.supabase.co:6543/postgres"

# Establish a connection to the Supabase database
conn = psycopg2.connect(connection_string)

# Create a cursor object to execute SQL queries
cur = conn.cursor()

# Execute a SQL query to retrieve data from a table
cur.execute("SELECT * FROM public.user")

# Fetch the results of the query
results = cur.fetchall()

print(results)
# Close the cursor and connection
cur.close()
conn.close()