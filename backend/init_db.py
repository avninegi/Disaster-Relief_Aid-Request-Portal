import sqlite3

conn = sqlite3.connect("db.sqlite3")
with open("seed.sql", "r") as f:
    conn.executescript(f.read())
conn.close()
print("Database seeded successfully.")
