const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const soundRoutes = require('./routes/soundRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(morgan('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Custom request logger
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path} - From: ${req.ip}`);
    next();
});

// Routes
app.use('/api', soundRoutes);
app.use('/api', deviceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Sound Location Tracker'
    });
});

// Root endpoint - serve the web interface
app.get('/api', (req, res) => {
    res.json({
        message: 'Sound Location Tracker API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            webInterface: 'GET /',
            devices: 'GET /api/devices',
            deviceHistory: 'GET /api/devices/:deviceId/history',
            activeDevices: 'GET /api/devices/active/list',
            startDetection: 'POST /api/detection/start',
            updatePower: 'PUT /api/detection/update',
            endDetection: 'POST /api/detection/end',
            activeDetections: 'GET /api/detections/active',
            detectionHistory: 'GET /api/detection/:detectionId/history'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    logger.success(`🚀 Server running on port ${PORT}`);
    logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🌐 API URL: http://localhost:${PORT}`);
    logger.info(`📖 API Documentation: http://localhost:${PORT}`);
    console.log('\n--- Sound Location Tracker Ready ---\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully...');
    process.exit(0);
});
