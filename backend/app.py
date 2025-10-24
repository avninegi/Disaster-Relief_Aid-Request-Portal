from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import time
import os
import sqlite3
from dijkstra import Graph

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

def get_conn():
    basedir = os.path.dirname(__file__)
    db_path = os.path.join(basedir, 'db.sqlite3')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def rows_to_dicts(rows):
    return [dict(r) for r in rows]

# ---- Compute Priority ----
def compute_priority(severity, population, last_aid_ts):
    now = int(time.time())
    days_since = max(1, (now - int(last_aid_ts)) // (24 * 3600))
    return round(severity * population / days_since, 2)

# ---- ZONES ----
@app.route('/api/zones', methods=['GET', 'POST'])
def zones():
    conn = get_conn()
    cur = conn.cursor()
    if request.method == 'POST':
        data = request.get_json()
        name = data['name']
        lat = data['lat']
        lon = data['lon']
        resources = data.get('resources', [])
        cur.execute("SELECT resources FROM zones WHERE lat=? AND lon=?", (lat, lon))
        row = cur.fetchone()
        if row:
            existing_resources = row['resources'].split(',') if row['resources'] else []
            new_resources = list(set(existing_resources + resources))
            cur.execute("UPDATE zones SET resources=? WHERE lat=? AND lon=?", (",".join(new_resources), lat, lon))
        else:
            cur.execute("INSERT INTO zones (name, lat, lon, resources) VALUES (?, ?, ?, ?)", (name, lat, lon, ",".join(resources)))
        conn.commit()
        conn.close()
        return jsonify(status="zone added"), 201
    # GET
    cur.execute("SELECT * FROM zones")
    rows = cur.fetchall()
    conn.close()
    return jsonify(rows_to_dicts(rows))

@app.route('/api/zones/delete', methods=['POST'])
def delete_zone():
    data = request.get_json()
    lat = data['lat']
    lon = data['lon']
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM zones WHERE lat=? AND lon=?", (lat, lon))
    conn.commit()
    conn.close()
    return jsonify(status="zone deleted")

# ---- AID REQUESTS ----
@app.route('/api/aid_request', methods=['POST'])
def add_request():
    data = request.get_json()
    zone_id = int(data['zone_id'])
    severity = int(data['severity'])
    population = int(data['population'])
    last_aid_ts = int(data.get('last_aid_timestamp', 0))
    priority = compute_priority(severity, population, last_aid_ts)

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO aid_requests (zone_id, resource_type, severity, population, last_aid_timestamp, priority_score) VALUES (?, ?, ?, ?, ?, ?)",
        (zone_id, data.get('resource_type', 'food'), severity, population, last_aid_ts, priority)
    )
    conn.commit()
    conn.close()
    return jsonify(priority_score=priority), 201

@app.route('/api/requests', methods=['GET'])
def list_requests():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT a.id, z.name AS zone_name, a.zone_id, a.resource_type, a.severity, 
               a.population, a.last_aid_timestamp, a.priority_score
        FROM aid_requests a
        JOIN zones z ON a.zone_id = z.id
        ORDER BY a.id DESC
    """)
    rows = cur.fetchall()
    conn.close()
    return jsonify(rows_to_dicts(rows))

# ---- SHORTEST PATH ----
@app.route('/api/shortest_path/<int:zone_id>', methods=['GET'])
def shortest_path(zone_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT source_id, target_id, distance_km FROM edges")
    edges = cur.fetchall()
    graph = Graph()
    for e in edges:
        graph.add_edge(e['source_id'], e['target_id'], e['distance_km'])
        graph.add_edge(e['target_id'], e['source_id'], e['distance_km'])
    dist, prev = graph.dijkstra(1)  # HQ is always zone_id 1
    path_ids = graph.reconstruct_path(prev, 1, zone_id)
    
    # Map ids to [lat, lon] coordinates
    coords = []
    if path_ids:
        placeholders = ",".join(["?"] * len(path_ids))
        cur.execute(f"SELECT id, lat, lon FROM zones WHERE id IN ({placeholders})", path_ids)
        all_coords = {row['id']: [row['lat'], row['lon']] for row in cur.fetchall()}
        coords = [all_coords[pid] for pid in path_ids if pid in all_coords]
    conn.close()
    return jsonify(
        path=coords,
        distance=dist.get(zone_id, float("inf"))
    )

# ---- FRONTEND SERVE ----
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if not path or path == 'index.html':
        return send_from_directory('../frontend', 'index.html')
    return send_from_directory('../frontend', path)

if __name__ == '__main__':
    app.run(debug=True)
