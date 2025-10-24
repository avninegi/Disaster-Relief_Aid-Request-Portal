-- DROP OLD TABLES
DROP TABLE IF EXISTS zones;
DROP TABLE IF EXISTS edges;
DROP TABLE IF EXISTS aid_requests;

-- TABLE SCHEMA
CREATE TABLE zones (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    altitude_m REAL DEFAULT 0
);

CREATE TABLE edges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER,
    target_id INTEGER,
    distance_km REAL,
    FOREIGN KEY(source_id) REFERENCES zones(id),
    FOREIGN KEY(target_id) REFERENCES zones(id)
);

CREATE TABLE aid_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone_id INTEGER,
    resource_type TEXT,
    severity INTEGER,
    population INTEGER,
    last_aid_timestamp INTEGER,
    priority_score REAL,
    FOREIGN KEY(zone_id) REFERENCES zones(id)
);

-- ZONES (including hilly/pilgrimage)
INSERT INTO zones (id, name, lat, lon, altitude_m) VALUES
(1,  'HQ Depot', 28.6139, 77.2090, 0),
(2,  'Gurugram', 28.4595, 77.0266, 200),
(3,  'Noida', 28.5355, 77.3910, 210),
(4,  'Faridabad', 28.4089, 77.3178, 195),
(5,  'Ghaziabad', 28.6692, 77.4538, 215),
(6,  'Palwal', 28.1423, 77.3327, 180),
(7,  'Bawal', 28.0677, 76.8155, 170),
(8,  'Dehradun', 30.3165, 78.0322, 640),
(9,  'Rishikesh', 30.0869, 78.2676, 372),
(10, 'Mussoorie', 30.4583, 78.0667, 2000),
(11, 'Haridwar', 29.9457, 78.1642, 314),
(12, 'Shimla', 31.1048, 77.1734, 2205),
(13, 'Kullu', 31.9630, 77.1090, 1250),
(14, 'Manali', 32.2432, 77.1892, 2050),
(15, 'Dharamshala', 32.2190, 76.3234, 1457),
(16, 'Chamba', 32.5211, 76.0736, 996),
(17, 'Nainital', 29.3919, 79.4542, 2084),
(18, 'Almora', 29.5983, 79.6598, 1646),
(19, 'Pithoragarh', 29.5810, 80.3340, 1660),
(20, 'Kedarnath', 30.7352, 79.0669, 3583),
(21, 'Badrinath', 30.7433, 79.4930, 3133),
(22, 'Joshimath', 30.5680, 79.5667, 1890),
(23, 'Rudraprayag', 30.2834, 78.9800, 670),
(24, 'Uttarkashi', 30.7268, 78.4354, 1158),
(25, 'Vaishno Devi', 33.0308, 74.9490, 520),
(26, 'Jammu', 32.7266, 74.8570, 327),
(27, 'Srinagar', 34.0837, 74.7973, 1585),
(28, 'Amarnath', 34.2167, 75.5167, 3888);

-- EDGES (bidirectional)
INSERT INTO edges (source_id, target_id, distance_km) VALUES
(1,2,35),(2,1,35),(1,3,25),(3,1,25),(1,4,40),(4,1,40),(1,5,45),(5,1,45),
(2,6,60),(6,2,60),(6,7,55),(7,6,55),(2,7,80),(7,2,80),(4,6,95),(6,4,95),(7,1,120),(1,7,120),
(3,8,260),(8,3,260),(5,11,200),(11,5,200),(1,11,210),(11,1,210),
(8,9,35),(9,8,35),(8,10,38),(10,8,38),(9,11,70),(11,9,70),
(9,23,90),(23,9,90),(23,20,45),(20,23,45),(23,22,50),(22,23,50),(22,21,45),(21,22,45),
(24,23,60),(23,24,60),(8,24,150),(24,8,150),(8,17,260),(17,8,260),(17,18,65),(18,17,65),
(18,19,175),(19,18,175),(8,12,320),(12,8,320),(12,13,115),(13,12,115),(13,14,45),(14,13,45),
(12,15,230),(15,12,230),(15,16,95),(16,15,95),(15,26,250),(26,15,250),(26,25,45),(25,26,45),
(26,27,250),(27,26,250),(27,28,100),(28,27,100);

-- SAMPLE AID REQUESTS
INSERT INTO aid_requests (zone_id, resource_type, severity, population, last_aid_timestamp, priority_score) VALUES
(3,'medical',4,150000,1696118400,78.5),
(9,'food',5,25000,1696204800,92.1),
(20,'medical',5,5000,1696400000,97.8),
(21,'food',4,4000,1696500000,88.9),
(28,'medical',5,3500,1696600000,95.4);
-- END OF FILE


