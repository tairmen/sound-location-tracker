# Sound Location Tracker - Web Interface Guide

## Overview
The Sound Location Tracker now includes an interactive web-based map interface that displays all devices and their sound detection activity in real-time.

## Features

### 🗺️ Interactive Map
- **Technology**: OpenStreetMap with Leaflet.js
- **Auto-refresh**: Updates every 5 seconds (toggle on/off)
- **Responsive Design**: Works on desktop and mobile devices

### 📍 Device Markers
- **Green Markers (🔊)**: Active detections happening now
- **Gray Markers (📍)**: Devices that previously detected sounds but are currently inactive

### 📊 Device Information Panel
Click any device marker to view:
- Device ID and status
- Current detection information (if active)
  - Sound power level (dB)
  - Detection start time and duration
  - GPS coordinates
  - Power update history with visual charts
- Complete detection history
  - All past detections
  - Duration of each detection
  - Sound power levels

## How to Use

### 1. Start the Server
```bash
# Make sure PostgreSQL is running and database is migrated
npm run dev
```

### 2. Open the Web Interface
Navigate to: `http://localhost:3000`

### 3. View Devices on Map
- The map automatically loads all devices
- Zoom in/out using mouse wheel or +/- buttons
- Click and drag to pan the map

### 4. Interact with Devices
- **Click a marker** to open the device details panel
- **View history** of all detections for that device
- **See power charts** showing how sound levels changed over time
- **Close panel** by clicking the × button

### 5. Control Panel
- **🔄 Refresh**: Manually refresh device data
- **⏸️ Auto-Refresh**: Toggle automatic updates (ON by default)
- **🎯 Center Map**: Fit all devices in view

## API Integration

### For Mobile Apps
Your mobile app should call these endpoints:

**1. When sound is first detected:**
```javascript
POST /api/detection/start
{
  "deviceId": "unique-device-id",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "soundPower": 75.5
}
```

**2. While detecting (continuous updates):**
```javascript
PUT /api/detection/update
{
  "deviceId": "unique-device-id",
  "soundPower": 80.2
}
```

**3. When sound stops:**
```javascript
POST /api/detection/end
{
  "deviceId": "unique-device-id"
}
```

## Testing the System

### Run the Demo Script
```bash
node test-demo.js
```

This will:
1. Simulate 3 devices at different locations in New York
2. Create detection events
3. Update sound power levels
4. End some detections
5. Show the current status

Then open `http://localhost:3000` to see the devices on the map!

## Map Controls

### Navigation
- **Zoom**: Mouse wheel or +/- buttons
- **Pan**: Click and drag
- **Reset View**: Click "🎯 Center Map"

### Device Panel
- **Open**: Click any device marker
- **Close**: Click × button or click outside
- **Scroll**: Scroll through detection history

### Statistics Header
- **Active Devices**: Currently detecting sounds
- **Total Detections**: Total detection records
- **Last Update**: Time of last data refresh

## Visual Indicators

### Marker Colors
- 🟢 **Green**: Device is actively detecting
- ⚫ **Gray**: Device is inactive

### Status Badges
- 🟢 Active: Detection in progress
- ⚫ Inactive: No current detection

### Power Charts
- Visual bars showing sound power over time
- Longer bar = higher sound power
- Gradient color from purple to blue

## Architecture

### Frontend (Web Interface)
```
public/
├── index.html          # Main HTML page
├── css/
│   └── style.css       # Responsive styling
└── js/
    └── map.js          # Map logic and API integration
```

### Backend (Server)
```
src/
├── controllers/
│   ├── SoundDetectionController.js  # Detection endpoints
│   └── DeviceController.js          # Device/map endpoints
├── models/
│   ├── SoundDetectionModel.js       # Detection data
│   └── DeviceModel.js               # Device data
└── routes/
    ├── soundRoutes.js               # Detection API
    └── deviceRoutes.js              # Device/map API
```

## Real-Time Logging

The server console shows all activity:
```
[2025-12-19T10:30:00.000Z] 🎵 NEW DETECTION | Device: mobile-001 | Location: (40.7580, -73.9855) | Power: 75.5 dB
[2025-12-19T10:30:15.000Z] 📊 POWER UPDATE | Device: mobile-001 | New Power: 78.2 dB
[2025-12-19T10:31:00.000Z] 🔇 DETECTION ENDED | Device: mobile-001 | Duration: 60.00s
[2025-12-19T10:31:05.000Z] 📱 Devices list requested | Total: 3
```

## Troubleshooting

### Map not loading?
- Check browser console for errors
- Ensure server is running on port 3000
- Verify internet connection (for OpenStreetMap tiles)

### No devices showing?
- Run test-demo.js to add sample data
- Check PostgreSQL connection
- Verify database migrations ran successfully

### Auto-refresh not working?
- Click "Auto-Refresh" button to toggle ON
- Check browser console for API errors
- Verify server is responding to /api/devices

## Future Enhancements

Possible additions:
- Sound triangulation to estimate sound source location
- Heatmap visualization of sound intensity
- Time-based playback of detection events
- Export detection data to CSV
- Filter devices by status or time range
- Real-time WebSocket updates instead of polling

## Browser Compatibility

Tested and working on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized for up to 1000 devices
- Auto-refresh interval: 5 seconds (configurable)
- Map markers update without page reload
- Efficient database queries with indexes
