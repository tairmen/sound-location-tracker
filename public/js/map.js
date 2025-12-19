// Configuration
const API_BASE_URL = '/api';
const REFRESH_INTERVAL = 5000; // 5 seconds
const DEFAULT_MAP_CENTER = [40.7128, -74.0060]; // New York as default
const DEFAULT_ZOOM = 12;

// State
let map;
let markers = {};
let autoRefreshEnabled = true;
let autoRefreshTimer;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initEventListeners();
    loadDevices();
    startAutoRefresh();
});

// Initialize the map
function initMap() {
    map = L.map('map').setView(DEFAULT_MAP_CENTER, DEFAULT_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    console.log('Map initialized');
}

// Initialize event listeners
function initEventListeners() {
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadDevices();
    });

    document.getElementById('autoRefreshBtn').addEventListener('click', toggleAutoRefresh);
    
    document.getElementById('centerMapBtn').addEventListener('click', centerMap);
    
    document.getElementById('closeSidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('active');
    });
}

// Load all devices from the server
async function loadDevices() {
    try {
        const response = await fetch(`${API_BASE_URL}/devices`);
        const result = await response.json();

        if (result.success) {
            updateStats(result.data);
            updateMarkers(result.data);
            updateLastUpdateTime();
        } else {
            console.error('Failed to load devices:', result.error);
        }
    } catch (error) {
        console.error('Error loading devices:', error);
    }
}

// Update statistics in the header
function updateStats(devices) {
    const activeDevices = devices.filter(d => d.is_active).length;
    const totalDetections = devices.filter(d => d.detection_id).length;

    document.getElementById('activeDevices').textContent = activeDevices;
    document.getElementById('totalDetections').textContent = totalDetections;
}

// Update last update time
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('en-US', { timeZone: 'UTC' });
    document.getElementById('lastUpdate').textContent = timeString;
}

// Update markers on the map
function updateMarkers(devices) {
    // Clear existing markers
    Object.values(markers).forEach(marker => map.removeLayer(marker));
    markers = {};

    // Filter devices that have location data
    const devicesWithLocation = devices.filter(d => d.latitude && d.longitude);

    if (devicesWithLocation.length === 0) {
        console.log('No devices with location data');
        return;
    }

    // Add markers for each device
    devicesWithLocation.forEach(device => {
        addDeviceMarker(device);
    });

    // Fit map to show all markers
    if (devicesWithLocation.length > 0) {
        const bounds = L.latLngBounds(
            devicesWithLocation.map(d => [d.latitude, d.longitude])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Add a marker for a device
function addDeviceMarker(device) {
    const isActive = device.is_active;
    
    // Custom icon based on status
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background: ${isActive ? '#2ecc71' : '#95a5a6'};
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            ">
                ${isActive ? '🔊' : '📍'}
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    const marker = L.marker([device.latitude, device.longitude], { icon })
        .addTo(map)
        .bindPopup(createPopupContent(device))
        .on('click', () => showDeviceDetails(device.device_id));

    markers[device.device_id] = marker;
}

// Create popup content for a marker
function createPopupContent(device) {
    const status = device.is_active ? 
        '<span style="color: #2ecc71; font-weight: bold;">🟢 Active</span>' : 
        '<span style="color: #95a5a6; font-weight: bold;">⚫ Inactive</span>';

    return `
        <div class="popup-content">
            <h4>Device: ${device.device_id}</h4>
            <p><strong>Status:</strong> ${status}</p>
            ${device.sound_power ? `<p><strong>Sound Power:</strong> ${device.sound_power} dB</p>` : ''}
            ${device.detected_at ? `<p><strong>Detected:</strong> ${new Date(device.detected_at).toLocaleString()}</p>` : ''}
            <p style="margin-top: 0.5rem;"><em>Click marker for full details</em></p>
        </div>
    `;
}

// Show device details in the sidebar
async function showDeviceDetails(deviceId) {
    const sidebar = document.getElementById('sidebar');
    const sidebarContent = document.getElementById('sidebarContent');

    // Show loading state
    sidebarContent.innerHTML = '<div class="loading">Loading device information...</div>';
    sidebar.classList.add('active');

    try {
        const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/history`);
        const result = await response.json();

        if (result.success) {
            sidebarContent.innerHTML = renderDeviceDetails(result.data);
        } else {
            sidebarContent.innerHTML = `<div class="empty-state">Failed to load device details</div>`;
        }
    } catch (error) {
        console.error('Error loading device details:', error);
        sidebarContent.innerHTML = `<div class="empty-state">Error loading device details</div>`;
    }
}

// Render device details HTML
function renderDeviceDetails(data) {
    const { device, detections } = data;
    
    const activeDetection = detections.find(d => d.is_active);
    const hasDetections = detections.length > 0;

    let html = `
        <div class="device-info">
            <div class="info-section">
                <h3>📱 Device Information</h3>
                <div class="info-item">
                    <span class="info-label">Device ID:</span>
                    <span class="info-value">${device.device_id}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Status:</span>
                    <span class="status-badge ${activeDetection ? 'status-active' : 'status-inactive'}">
                        ${activeDetection ? '🟢 Active' : '⚫ Inactive'}
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">First Seen:</span>
                    <span class="info-value">${new Date(device.created_at).toLocaleString()}</span>
                </div>
            </div>
    `;

    if (activeDetection) {
        html += `
            <div class="info-section">
                <h3>🎵 Current Detection</h3>
                <div class="info-item">
                    <span class="info-label">Location:</span>
                    <span class="info-value">${parseFloat(activeDetection.latitude).toFixed(6)}, ${parseFloat(activeDetection.longitude).toFixed(6)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sound Power:</span>
                    <span class="info-value">${activeDetection.sound_power} dB</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Started:</span>
                    <span class="info-value">${new Date(activeDetection.detected_at).toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Duration:</span>
                    <span class="info-value">${calculateDuration(activeDetection.detected_at)}</span>
                </div>
        `;

        if (activeDetection.powerHistory && activeDetection.powerHistory.length > 0) {
            html += `
                <div class="power-chart">
                    <h4 style="margin-bottom: 0.5rem; color: #667eea;">Power History:</h4>
                    ${renderPowerChart(activeDetection.powerHistory)}
                </div>
            `;
        }

        html += `</div>`;
    }

    if (hasDetections) {
        html += `
            <div class="info-section">
                <h3>📊 Detection History (${detections.length})</h3>
                <div class="detection-list">
                    ${detections.map(detection => renderDetection(detection)).join('')}
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>No detections recorded yet</p>
            </div>
        `;
    }

    html += `</div>`;

    return html;
}

// Render a single detection item
function renderDetection(detection) {
    const isActive = detection.is_active;
    const duration = detection.ended_at ? 
        calculateDuration(detection.detected_at, detection.ended_at) : 
        calculateDuration(detection.detected_at);

    return `
        <div class="detection-item ${isActive ? 'active' : ''}">
            <div class="detection-header">
                <span class="detection-id">${isActive ? '🟢' : '⚫'} Detection #${detection.id}</span>
                <span class="detection-time">${new Date(detection.detected_at).toLocaleString()}</span>
            </div>
            <div class="detection-details">
                <div class="detection-detail">
                    <span class="detail-label">Sound Power</span>
                    <span class="detail-value">${detection.sound_power} dB</span>
                </div>
                <div class="detection-detail">
                    <span class="detail-label">Duration</span>
                    <span class="detail-value">${duration}</span>
                </div>
                <div class="detection-detail">
                    <span class="detail-label">Latitude</span>
                    <span class="detail-value">${parseFloat(detection.latitude).toFixed(6)}</span>
                </div>
                <div class="detection-detail">
                    <span class="detail-label">Longitude</span>
                    <span class="detail-value">${parseFloat(detection.longitude).toFixed(6)}</span>
                </div>
            </div>
            ${detection.powerHistory && detection.powerHistory.length > 1 ? `
                <div class="power-chart">
                    <strong style="font-size: 0.85rem;">Power Updates (${detection.powerHistory.length}):</strong>
                    ${renderPowerChart(detection.powerHistory.slice(0, 5))}
                    ${detection.powerHistory.length > 5 ? `<p style="font-size: 0.75rem; color: #95a5a6; margin-top: 0.5rem;">+ ${detection.powerHistory.length - 5} more updates</p>` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

// Render power history chart
function renderPowerChart(powerHistory) {
    const maxPower = Math.max(...powerHistory.map(p => parseFloat(p.sound_power)));
    
    return powerHistory.map(update => {
        const percentage = (parseFloat(update.sound_power) / maxPower) * 100;
        return `
            <div class="chart-item">
                <span class="chart-time">${new Date(update.recorded_at).toLocaleTimeString()}</span>
                <div class="chart-bar" style="width: ${percentage}%"></div>
                <span class="chart-value">${update.sound_power} dB</span>
            </div>
        `;
    }).join('');
}

// Calculate duration between two dates
function calculateDuration(start, end = null) {
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const diff = endTime - startTime;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

// Toggle auto-refresh
function toggleAutoRefresh() {
    autoRefreshEnabled = !autoRefreshEnabled;
    const btn = document.getElementById('autoRefreshBtn');

    if (autoRefreshEnabled) {
        btn.textContent = '⏸️ Auto-Refresh: ON';
        btn.classList.add('active');
        startAutoRefresh();
    } else {
        btn.textContent = '▶️ Auto-Refresh: OFF';
        btn.classList.remove('active');
        stopAutoRefresh();
    }
}

// Start auto-refresh
function startAutoRefresh() {
    if (autoRefreshEnabled) {
        autoRefreshTimer = setInterval(() => {
            loadDevices();
        }, REFRESH_INTERVAL);
    }
}

// Stop auto-refresh
function stopAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
    }
}

// Center map on all devices
function centerMap() {
    const allMarkers = Object.values(markers);
    
    if (allMarkers.length === 0) {
        map.setView(DEFAULT_MAP_CENTER, DEFAULT_ZOOM);
    } else if (allMarkers.length === 1) {
        map.setView(allMarkers[0].getLatLng(), 15);
    } else {
        const bounds = L.latLngBounds(allMarkers.map(m => m.getLatLng()));
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}
