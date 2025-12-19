# Sound Location Tracker

A Node.js server application for tracking sound location based on multiple mobile device detections. The system receives data from mobile devices that detect target sounds and stores the information including device coordinates, detection time, and sound power.

## Features

- Track sound detections from multiple mobile devices
- Real-time sound power updates
- PostgreSQL database for data persistence
- RESTful API endpoints
- Real-time console logging
- Detection history tracking
- **Interactive web map interface with OpenStreetMap**
- **Visual device tracking and monitoring**
- **Click-to-view device history and current detections**

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

## Installation

1. Clone the repository:
```bash
cd sound-location-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your PostgreSQL credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=sound_tracker

PORT=3000
NODE_ENV=development
```

4. Create the database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sound_tracker;
\q
```

5. Run database migrations:
```bash
npm run db:migrate
```

## Usage

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## Web Interface

Open your browser and navigate to:
```
http://localhost:3000
```

The web interface provides:
- **Interactive Map**: View all devices on an OpenStreetMap
- **Real-time Updates**: Auto-refresh every 5 seconds (can be toggled)
- **Device Status**: Green markers for active detections, gray for inactive
- **Click for Details**: Click any device marker to view:
  - Device information
  - Current detection status
  - Full detection history
  - Sound power update charts
- **Statistics Dashboard**: View active devices and total detections at a glance

## API Endpoints

### 1. Start Sound Detection
**POST** `/api/detection/start`

Triggered when a mobile device first detects the target sound.

**Request Body:**
```json
{
  "deviceId": "device123",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "soundPower": 75.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sound detection started",
  "data": {
    "id": 1,
    "device_id": "device123",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "sound_power": 75.5,
    "is_active": true,
    "detected_at": "2025-12-19T10:30:00.000Z"
  }
}
```

### 2. Update Sound Power
**PUT** `/api/detection/update`

Updates sound power while the mobile device continues detecting the sound.

**Request Body:**
```json
{
  "deviceId": "device123",
  "soundPower": 80.2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sound power updated",
  "data": {
    "id": 1,
    "device_id": "device123",
    "sound_power": 80.2,
    "updated_at": "2025-12-19T10:30:15.000Z"
  }
}
```

### 3. End Sound Detection
**POST** `/api/detection/end`

Triggered when the mobile device stops detecting the target sound.

**Request Body:**
```json
{
  "deviceId": "device123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sound detection ended",
  "data": {
    "id": 1,
    "device_id": "device123",
    "is_active": false,
    "detected_at": "2025-12-19T10:30:00.000Z",
    "ended_at": "2025-12-19T10:31:00.000Z"
  }
}
```

### 4. Get Active Detections
**GET** `/api/detections/active`

Retrieves all currently active sound detections.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "device_id": "device123",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "sound_power": 80.2,
      "is_active": true,
      "detected_at": "2025-12-19T10:30:00.000Z"
    }
  ]
}
```

### 5. Get Detection History
**GET** `/api/detection/:detectionId/history`

Retrieves detailed history of a specific detection including all power updates.

**Response:**
```json
{
  "success": true,
  "data": {
    "detection": {
      "id": 1,
      "device_id": "device123",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "sound_power": 80.2
    },
    "powerHistory": [
      {
        "id": 1,
        "detection_id": 1,
        "sound_power": 80.2,
        "recorded_at": "2025-12-19T10:30:15.000Z"
      }
    ]
  }
}
```

### 6. Get All Devices (Web Interface Endpoint)
**GET** `/api/devices`

Retrieves all devices with their latest detection status and location.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "device_id": "device123",
      "detection_id": 1,
      "latitude": 40.7128,
      "longitude": -74.0060,
      "sound_power": 80.2,
      "is_active": true,
      "detected_at": "2025-12-19T10:30:00.000Z"
    }
  ]
}
```

### 7. Get Device History (Web Interface Endpoint)
**GET** `/api/devices/:deviceId/history`

Retrieves full detection history for a specific device with power updates.

**Response:**
```json
{
  "success": true,
  "data": {
    "device": {
      "device_id": "device123",
      "created_at": "2025-12-19T10:00:00.000Z"
    },
    "detections": [
      {
        "id": 1,
        "latitude": 40.7128,
        "longitude": -74.0060,
        "sound_power": 80.2,
        "is_active": true,
        "powerHistory": [...]
      }
    ]
  }
}
```

## Database Schema

### Tables

**devices**
- `device_id` (VARCHAR, Primary Key)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**sound_detections**
- `id` (SERIAL, Primary Key)
- `device_id` (VARCHAR, Foreign Key)
- `latitude` (DECIMAL)
- `longitude` (DECIMAL)
- `sound_power` (DECIMAL)
- `detected_at` (TIMESTAMP)
- `ended_at` (TIMESTAMP)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**sound_power_updates**
- `id` (SERIAL, Primary Key)
- `detection_id` (INTEGER, Foreign Key)
- `sound_power` (DECIMAL)
- `recorded_at` (TIMESTAMP)

## Real-time Logging

The server logs all events to the console in real-time:

- 🎵 New sound detection started
- 📊 Sound power updates
- 🔇 Detection ended
- ℹ️ General information
- ⚠️ Warnings
- ❌ Errors

## Example Console Output

```
[2025-12-19T10:30:00.000Z] ✅ SUCCESS: 🚀 Server running on port 3000
[2025-12-19T10:30:05.123Z] ℹ️  INFO: POST /api/detection/start - From: ::1
[2025-12-19T10:30:05.145Z] ℹ️  INFO: 🎵 NEW DETECTION | Device: device123 | Location: (40.7128, -74.006) | Power: 75.5 dB | Detection ID: 1
[2025-12-19T10:30:15.234Z] ℹ️  INFO: 📊 POWER UPDATE | Device: device123 | Detection ID: 1 | New Power: 80.2 dB
[2025-12-19T10:31:00.567Z] ℹ️  INFO: 🔇 DETECTION ENDED | Device: device123 | Detection ID: 1 | Duration: 60.00s
```

## Project Structure

```
sound-location-tracker/
├── src/
│   ├── controllers/
│   │   └── SoundDetectionController.js
│   ├── database/
│   │   ├── db.js
│   │   ├── migrate.js
│   │   └── schema.sql
│   ├── models/
│   │   └── SoundDetectionModel.js
│   ├── routes/
│   │   └── soundRoutes.js
│   ├── utils/
│   │   └── logger.js
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## License

ISC
