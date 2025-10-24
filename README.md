# 🌍 Disaster Relief Aid Request Portal

> **Efficient, simulation-based decision support for resource allocation in disaster scenarios. Combines Dijkstra’s algorithm, intelligent prioritization, and interactive web mapping.**

***

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Screenshots](#screenshots)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)
- [References](#references)

***

## 🚨 Overview

This portal allows disaster planners to optimize aid delivery to affected zones.  
It leverages shortest-path algorithms and dynamic priority calculations with a modern, user-focused dashboard.

***

## ✨ Features

- **Aid Request Submission**: Choose zone/resource, severity, population.
- **Data Structures & Algorithms**: Dijkstra for pathfinding, priority queues for request urgency.
- **Live Map Routing**: Visualizes optimized routes from depot to affected zones.
- **Criticality Analytics**: Auto "Most Critical" highlighting, real-time heatmaps, resource charts.
- **Intuitive Dashboard**: Drag depot, interact with popups, compare zone priorities.
- **Custom Badges/Markers**: Color-coded pins, urgent zone emphasis.


***

## 🛠 Tech Stack

| Area         | Tool/Lib                         |
|--------------|----------------------------------|
| Backend      | Python Flask                     |
| Database     | SQLite                           |
| Frontend     | HTML, CSS, JavaScript            |
| Map/Routing  | Leaflet.js, Leaflet Routing Machine, Leaflet.heat |
| Analytics    | Chart.js                         |

***

## 📁 Project Structure

```
backend/
    app.py
    dijkstra.py
    models.py
    requirements.txt
    seed.sql
    db.sqlite3          # (auto-generated, optional to commit)
frontend/
    index.html
    app.js
    styles.css
screenshots/
    Screenshot-142.jpg
    Screenshot-143.jpg
    Screenshot-144.jpg
    Screenshot-145.jpg
    Screenshot-146.jpg
README.md

```

***

## 🚀 Getting Started

### Prerequisites
- Python 3.x
- pip

### 1. Clone the repository
```bash
git clone https://github.com/kumar-shubham1/Disaster-Relief_Aid-Request-Portal.git
cd Disaster-Relief_Aid-Request-Portal
```

### 2. Create and activate a virtual environment
**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```
**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install backend dependencies
```bash
pip install -r backend/requirements.txt
```

### 4. Initialize the database
**Option A:**
```bash
python backend/init_db.py
```
**Option B (manual):**
```bash
python -c "import sqlite3, pathlib; db=sqlite3.connect('backend/db.sqlite3'); db.executescript(pathlib.Path('backend/seed.sql').read_text()); db.commit(); db.close()"
```

### 5. Start the backend server
```bash
python backend/app.py
```
Backend running at: [http://127.0.0.1:5000](http://127.0.0.1:5000)

### 6. Start the frontend server (in frontend folder)
```bash
cd frontend
python -m http.server 8000
```
Frontend at: [http://localhost:8000](http://localhost:8000)

***

## 🖼️ Screenshots

### Map with routes and affected zones
![Map with Routes](screenshots/Screenshot-142screenshots/Screenshot-146/resource bar charts
![Priority Chart](screenshots/Screenshot-143screenshots/Screenshot-144 request dashboard UI
![Dashboard UI](screenshots/Screenshot-144 Usage

- Open your browser at [http://localhost:8000](http://localhost:8000)
- **Add aid requests:** select zone, resource type, severity, population.
- **See dynamic routing:** Dijkstra finds the fastest allocation path.
- **View analytics:** Check “Most Critical” badges, heatmap, and bar charts.
- **Get details instantly:** Hover/click markers for zone data and route/distance info.

***

## 🛟 Troubleshooting

| Issue                                | Solution                                    |
|---------------------------------------|---------------------------------------------|
| Could not run Flask                   | Activate your virtual environment           |
| Dependency errors                     | Run `pip install -r backend/requirements.txt` |
| Database not found                    | Run database setup step above               |
| Port already in use                   | Change port in the command (add `--port`)   |
| Frontend not loading                  | Ensure both backend and frontend servers are running |


***

## 💡 Contributing

Pull requests are welcome!  
Fork the repo, create a feature branch, open a PR.

***

## 🧑‍💻 Team

- **Shubham Kumar** (**TEAM LEAD**)
- **Avni Negi**
- **Jahnvi Sharma**
- **Parikshit Panwar**

***

## 📜 License

This project is for academic/demonstration use under GEU CSE PBL.

***

## 🔗 References

- [LeafletJS](https://leafletjs.com)
- [Chart.js](https://www.chartjs.org/)
- [Python Flask](https://flask.palletsprojects.com/)
- [Render Cloud Hosting](https://render.com/)
