import sqlite3
import os

# def get_conn():
#     base_dir = os.path.dirname(__file__)
#     db_path = os.path.join(base_dir, 'db.sqlite3')
#     return sqlite3.connect(db_path)
# def rows_to_dicts(rows):
#     """Convert SQLite rows (tuples) to list of dicts with column names."""
#     if not rows:
#         return []
#     # Get column names from cursor description
#     conn = get_conn()
#     cur = conn.cursor()
#     cur.execute('PRAGMA table_info(zones)')
#     colnames = [c[1] for c in cur.fetchall()]
#     conn.close()
#     # Match each tuple to a dict using those column names
#     return [dict(zip(colnames, r)) for r in rows]

import sqlite3
import os

def get_conn():
    base_dir = os.path.dirname(__file__)
    db_path = os.path.join(base_dir, 'db.sqlite3')
    return sqlite3.connect(db_path)

def rows_to_dicts(rows, cursor):
    """Convert SQLite rows (tuples) to list of dicts with column names."""
    if not rows:
        return []
    cols = [desc[0] for desc in cursor.description]
    return [dict(zip(cols, row)) for row in rows]

def create_tables():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS zones (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            lat REAL NOT NULL,
            lon REAL NOT NULL,
            resources TEXT
        )
    """)
    conn.commit()
    conn.close()

def add_zone(name, lat, lon, resources):
    conn = get_conn()
    cur = conn.cursor()
    # Check if zone exists
    cur.execute("SELECT resources FROM zones WHERE lat=? AND lon=?", (lat, lon))
    row = cur.fetchone()
    if row:
        existing_resources = row[0].split(',') if row[0] else []
        new_resources = list(set(existing_resources + resources))
        cur.execute("UPDATE zones SET resources=? WHERE lat=? AND lon=?", (','.join(new_resources), lat, lon))
    else:
        cur.execute("INSERT INTO zones (name, lat, lon, resources) VALUES (?, ?, ?, ?)",
                    (name, lat, lon, ','.join(resources)))
    conn.commit()
    conn.close()

def get_zones():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM zones")
    rows = cur.fetchall()
    result = rows_to_dicts(rows, cur)
    conn.close()
    return result

def delete_zone(lat, lon):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM zones WHERE lat=? AND lon=?", (lat, lon))
    conn.commit()
    conn.close()
#         dist = {n: float('inf') for n in self.adj.keys()}
#         prev = {}
#         dist[source] = 0
#         pq = [(0, source)]
#         while pq: 