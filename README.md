***

# Disaster Relief Aid Request Portal

A simulation-based platform for efficient disaster relief resource allocation using Dijkstra's algorithm, priority scoring, and interactive map visualization (Flask backend, Leaflet/Chart.js frontend).

***

## Table of Contents
- [About the Project](#about-the-project)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)
- [References](#references)

***

## About the Project

This portal simulates disaster relief resource allocation to affected zones.  
It uses data structures & algorithms (Dijkstra's shortest path, priority queue logic) combined with a user-friendly web dashboard, allowing planners to optimize delivery routes and visualize priorities.

***

## Features

- **Aid Request Management**: Add multiple requests for zones/resources; supports food, water, medicine.
- **Intelligent Prioritization**: Automatic "criticality" scoring by severity, population, days since last aid.
- **Live Routing**: Route calculation via Dijkstra and Leaflet Routing Machine; visualizes optimal paths.
- **Heat Map & Stats**: Real-time heatmap overlay for crisis zones; dynamic charts of priority/resources.
- **Interactive UI**: Move depot, submit requests, view popups on affected zones.
- **Custom Markers & Badges**: Resource/urgency colored pins, "Most Critical" highlighting per resource.

***

## Technology Stack

- **Backend**: Python, Flask, SQLite
- **Frontend**: HTML, CSS, JavaScript
    - Leaflet.js (map visualization, routing)
    - Chart.js (priority/resource statistics)
    - Leaflet.heat (crisis severity heatmap)
- **Data Structures & Algorithms**: Dijkstra's, priority queue, graph simulation

***

## Project Structure
```
```
/backend
    app.py
    dijkstra.py
    models.py
    requirements.txt
    seed.sql
    db.sqlite3 (optional – usually generated from seed)
/frontend
    index.html
    app.js
    styles.css
/screenshots
    Screenshot-142.jpg
    Screenshot-143.jpg
    Screenshot-144.jpg
... (additional assets)
DSA_PBL-phase-2-report.pdf
README.md
```

***

## Setup Instructions

### Prerequisites

- Python 3.x
- pip
- Node.js (optional, not required for static frontend)

### 1. Install backend dependencies

```bash
pip install -r backend/requirements.txt
```

### 2. Set up the database

```bash
python backend/init_db.py
```
*(Or use sqlite3 and seed.sql as needed)*

### 3. Run the Flask backend

```bash
python backend/app.py
```

### 4. Run the frontend locally (from the frontend directory)

```bash
python -m http.server 8000
```
Then visit: [http://localhost:8000](http://localhost:8000)

***

## Usage

1. Start both backend and frontend servers.
2. Open the app in your browser.
3. Select zones and resources, add requests, and click "Submit All Requests."
4. View optimized resource routes, priorities on charts, and heatmap visualization.
5. Hover over zone markers for critical details (distance, route).

***

## Screenshots

_Add screenshots from `/screenshots` here (drag onto README or link):_

- Map with routes and affected zones
- Priority/resource bar charts
- Criticality heatmap overlay
- Aid request UI

***

## Contributing

Pull requests are welcome!  
To contribute, fork the repo, create a new branch, and submit your changes via PR.

***

## Team

- **Shubham Kumar**  
- Add other members here as needed.

***

## License

This project is for academic use and demonstration.  
See LICENSE file for details, or specify your open-source license here.

***

## References

- [LeafletJS](https://leafletjs.com)
- [Chart.js](https://www.chartjs.org/)
- [Render](https://render.com/)
- [Python Flask Docs](https://flask.palletsprojects.com/)

***

