-- Sound Location Tracker Database Schema

-- Table to store mobile devices information
CREATE TABLE IF NOT EXISTS devices (
    device_id VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store sound detection sessions
CREATE TABLE IF NOT EXISTS sound_detections (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) REFERENCES devices(device_id),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    sound_power DECIMAL(10, 2) NOT NULL,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store sound power updates during active detection
CREATE TABLE IF NOT EXISTS sound_power_updates (
    id SERIAL PRIMARY KEY,
    detection_id INTEGER REFERENCES sound_detections(id) ON DELETE CASCADE,
    sound_power DECIMAL(10, 2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_detections_device_id ON sound_detections(device_id);
CREATE INDEX IF NOT EXISTS idx_detections_is_active ON sound_detections(is_active);
CREATE INDEX IF NOT EXISTS idx_detections_detected_at ON sound_detections(detected_at);
CREATE INDEX IF NOT EXISTS idx_power_updates_detection_id ON sound_power_updates(detection_id);
