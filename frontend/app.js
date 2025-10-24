const API_BASE = 'http://127.0.0.1:5000/api';
let map;
let zoneMarkers = {};
let addedZones = [];
let priorityChart, resourceChart;
let routingControls = [];
let depotLatLng = L.latLng(28.6, 77.2); // HQ Depot default
let heatLayer;

// Heatmap weights per zone
function computeCriticality(z) {
  // days since last aid
  const now = Math.floor(Date.now() / 1000);
  const daysSince = z.lastAidDays > 0 ? z.lastAidDays : ((now - (z.lastAidTimestamp || now)) / 86400);
  return z.severity * z.population * (1 + 0.3 * daysSince);
}

function getResourceColor(resource) {
  if (resource === "food") return "orange";
  if (resource === "water") return "blue";
  if (resource === "medicine") return "red";
  return "gray";
}

// Custom icon generator for each marker
function getZoneIcon(resource, severity) {
  const color = getResourceColor(resource);
  const size = 30 + Math.min(severity, 10) * 3;
  // SVG icon string for colored circle marker (no image needed)
  const svg = encodeURIComponent(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" stroke="black" stroke-width="2" fill="${color}" /></svg>`);
  return L.icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size], // center bottom
    popupAnchor: [0, -size / 2]
  });
}

async function init() {
  map = L.map('map').setView([28.6, 77.2], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  const depotMarker = L.marker(depotLatLng, { draggable: true })
    .addTo(map)
    .bindPopup("<b>HQ Depot (Drag me!)</b>")
    .openPopup();

  depotMarker.on('dragend', async function (e) {
    depotLatLng = e.target.getLatLng();
    redrawAllRoutes();
  });

  await loadZones();
  document.getElementById('reqForm').addEventListener('submit', submitAllRequests);
  document.getElementById('addZoneBtn').addEventListener('click', addZoneToList);
}

async function requestJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

async function loadZones() {
  const zones = await requestJSON(`${API_BASE}/zones`);
  const zoneSelect = document.getElementById('zone');
  zoneSelect.innerHTML = '<option value="" disabled selected>Select a zone</option>';
  zones
    .filter(z => !z.name.toLowerCase().includes('hq depot'))
    .forEach(z => {
      const opt = document.createElement('option');
      opt.value = z.id;
      opt.textContent = z.name;
      zoneSelect.appendChild(opt);

      // Initial marker: neutral icon, to be colored/updated when added for aid request
      zoneMarkers[z.id] = L.marker([z.lat, z.lon], { icon: getZoneIcon("food", 1) }).addTo(map)
        .bindPopup(`<b>${z.name}</b>`);
    });
}

function addZoneToList() {
  const zoneSelect = document.getElementById('zone');
  const selectedId = parseInt(zoneSelect.value);
  if (!selectedId) return alert('Select a zone first!');

  const resource = document.getElementById('resource').value;
  const severity = parseInt(document.getElementById('severity').value);
  const population = parseInt(document.getElementById('population').value);
  const lastAidDays = parseInt(document.getElementById('lastAid').value);

  if (addedZones.find(z => z.id === selectedId && z.resource === resource)) {
    return alert('This resource already requested for this zone.');
  }

  const selectedText = zoneSelect.options[zoneSelect.selectedIndex].text;
  addedZones.push({ id: selectedId, name: selectedText, resource, severity, population, lastAidDays });
  renderAddedZones();
  const zoneData = zoneMarkers[selectedId].getLatLng();
  // Update zone marker with resource color and sized by severity
  zoneMarkers[selectedId].setIcon(getZoneIcon(resource, severity));
  // Markers for hotspots (most critical) get yellow border via SVG
  highlightCriticalZones();
  drawRoute(depotLatLng, { ...addedZones[addedZones.length - 1], lat: zoneData.lat, lon: zoneData.lng });
  updateHeatmap();
}

function renderAddedZones() {
  // Compute "most critical" zones for each resource type.
  let criticalities = {};
  addedZones.forEach(z => {
    const c = computeCriticality(z);
    if (!criticalities[z.resource] || c > criticalities[z.resource].score) {
      criticalities[z.resource] = { score: c, pairs: [`${z.id}--${z.resource}`] };
    } else if (c === criticalities[z.resource].score) {
      criticalities[z.resource].pairs.push(`${z.id}--${z.resource}`);
    }
  });

  const list = document.getElementById('addedZonesList');
  list.innerHTML = '';
  addedZones.forEach((z, i) => {
    const key = `${z.id}--${z.resource}`;
    const isCritical = criticalities[z.resource] && criticalities[z.resource].pairs.includes(key);
    const badge = isCritical ? " <span style='color:red;font-weight:bold;'>Most Critical</span>" : "";
    const li = document.createElement('li');
    li.innerHTML = `${z.name} — ${z.resource}${badge} <button class="deleteBtn" data-index="${i}">🗑️</button>`;
    list.appendChild(li);
  });

  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', e => {
      const index = parseInt(e.target.dataset.index);
      addedZones.splice(index, 1);
      renderAddedZones();
      redrawAllRoutes();
      updateHeatmap && updateHeatmap();
    });
  });
}


function highlightCriticalZones() {
  // Find most critical zone and update its marker (yellow border, etc.)
  if (addedZones.length === 0) return;
  const mostCritical = [...addedZones].sort((a, b) => computeCriticality(b) - computeCriticality(a))[0];
  if (mostCritical) {
    zoneMarkers[mostCritical.id].setIcon(L.icon({
      iconUrl: `data:image/svg+xml,${encodeURIComponent(
          `<svg width="44" height="44" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="19" stroke="gold" stroke-width="4" fill="${getResourceColor(mostCritical.resource)}"/>
          </svg>`
        )}`,
      iconSize: [44,44], iconAnchor: [22,44], popupAnchor: [0,-22]
    }));
  }
}

function redrawAllRoutes() {
  routingControls.forEach(rc => map.removeControl(rc));
  routingControls = [];
  addedZones.forEach(zone => {
    const zoneData = zoneMarkers[zone.id].getLatLng();
    drawRoute(depotLatLng, { ...zone, lat: zoneData.lat, lon: zoneData.lng });
  });
  updateHeatmap();
}

async function submitAllRequests(e) {
  e.preventDefault();
  if (addedZones.length === 0) return alert('Add at least one zone first.');
  for (const zone of addedZones) {
    const last_aid_timestamp = zone.lastAidDays > 0
      ? Math.floor(Date.now() / 1000) - (zone.lastAidDays * 86400)
      : 0;
    const payload = {
      zone_id: zone.id,
      resource_type: zone.resource,
      severity: zone.severity,
      population: zone.population,
      last_aid_timestamp
    };
    await requestJSON(`${API_BASE}/aid_request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  alert(`Submitted ${addedZones.length} requests successfully!`);
  updateCharts();
}

function drawRoute(depotLatLng, zone) {
  const routingControl = L.Routing.control({
    waypoints: [depotLatLng, L.latLng(zone.lat, zone.lon)],
    lineOptions: { styles: [{ color: 'red', weight: 6, opacity: 0.85 }] },
    routeWhileDragging: false,
    draggableWaypoints: false,
    addWaypoints: false,
    show: false, // Remove the panel!
    fitSelectedRoutes: true
  }).addTo(map);

  routingControl.on('routesfound', function(e) {
    const route = e.routes[0];
    const distance = (route.summary.totalDistance / 1000).toFixed(2);
    const infoContent = `<b>${zone.name} (${zone.resource})</b><br>
      <b>Shortest Path: Dijkstra (via Leaflet Routing Machine)</b><br>
      <b>Total Distance:</b> ${distance} km`;
    zoneMarkers[zone.id].bindPopup(infoContent);
    zoneMarkers[zone.id].on('mouseover', function() { this.openPopup(); });
    zoneMarkers[zone.id].on('mouseout', function() { this.closePopup(); });
  });

  routingControls.push(routingControl);
  updateHeatmap();
}

function updateHeatmap() {
  // Remove old heatmap
  if (heatLayer) map.removeLayer(heatLayer);
  // Prepare array: [lat, lon, intensity]
  const heatData = addedZones.map(
    z => [zoneMarkers[z.id].getLatLng().lat, zoneMarkers[z.id].getLatLng().lng, computeCriticality(z)]
  );
  // scale intensity to [0,1]
  const max = heatData.length ? Math.max(...heatData.map(x => x[2])) : 1;
  const heatInput = heatData.map(([lat, lng, v]) => [lat, lng, v/max]);
  if (heatInput.length > 0) {
    heatLayer = L.heatLayer(heatInput, {
      radius: 38,
      gradient: { 0.2: "blue", 0.5: "lime", 0.8: "red" },
      maxZoom: 15
    }).addTo(map);
  }
}

function readablePriority(score) {
  if (score >= 1e7) return (score / 1e7).toFixed(2) + ' Cr';
  if (score >= 1e5) return (score / 1e5).toFixed(2) + ' L';
  if (score >= 1e3) return (score / 1e3).toFixed(1) + ' K';
  return score;
}

async function updateCharts() {
  const reqs = await requestJSON(`${API_BASE}/requests`);
  if (!reqs.length) return;

  const zoneResNames = addedZones.map(z => `${z.name} — ${z.resource}`);
  const filteredReqs = reqs.filter(r => zoneResNames.includes(`${r.zone_name} — ${r.resource_type}`));
  const zoneNames = zoneResNames;
  const prioritiesRaw = zoneNames.map(name => {
    const entries = filteredReqs.filter(r => (`${r.zone_name} — ${r.resource_type}`) === name);
    const score = entries.reduce((a, b) => a + (b.priority_score || 0), 0);
    return score || 0;
  });
  const priorities = prioritiesRaw.map(readablePriority);

  const resources = zoneNames.map(name => {
    const entries = filteredReqs.filter(r => (`${r.zone_name} — ${r.resource_type}`) === name);
    const totalPriority = entries.reduce((a, b) => a + (b.priority_score || 0), 0);
    const avgPriority = entries.length ? totalPriority / entries.length : 0;
    const amount = avgPriority > 0 ? avgPriority * 0.2 : 0;
    const type = entries.length ? entries[0].resource_type : 'food';
    return { name, amount: amount.toFixed(2), type };
  });

  const ctx1 = document.getElementById('priorityChart');
  const ctx2 = document.getElementById('resourceChart');

  if (priorityChart) priorityChart.destroy();
  if (resourceChart) resourceChart.destroy();

  priorityChart = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: zoneNames,
      datasets: [{
        label: 'Priority',
        data: priorities,
        backgroundColor: 'rgba(54,162,235,0.7)',
        borderColor: 'rgba(54,162,235,1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Priority Score' } },
        x: {
          title: { display: true, text: 'Zones + Resource' },
          ticks: { autoSkip: false, maxRotation: 55, minRotation: 30, font: { size: 14 }, padding: 8 }
        }
      },
      plugins: { 
        legend: { labels: { font: { size: 14 } } },
        tooltip: {
          callbacks: {
            label: (context) => {
              const index = context.dataIndex;
              return `Priority: ${priorities[index]} (raw ${prioritiesRaw[index]})`;
            }
          }
        }
      }
    }
  });

  const colors = { food: 'rgba(255,99,132,0.7)', water: 'rgba(75,192,192,0.7)', medicine: 'rgba(255,206,86,0.7)' };
  resourceChart = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: resources.map(r => r.name),
      datasets: [{
        label: 'Resources (units)',
        data: resources.map(r => r.amount),
        backgroundColor: resources.map(r => colors[r.type] || 'gray'),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Resource Amount (units)' } },
        x: {
          title: { display: true, text: 'Zones + Resource' },
          ticks: { autoSkip: false, maxRotation: 55, minRotation: 30, font: { size: 14 }, padding: 8 }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const zone = resources[ctx.dataIndex];
              return `${zone.amount} units of ${zone.type}`;
            }
          }
        }
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', init);
