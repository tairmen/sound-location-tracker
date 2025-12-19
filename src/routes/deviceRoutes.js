const express = require('express');
const DeviceController = require('../controllers/DeviceController');

const router = express.Router();

// Get all devices with their latest status
router.get('/devices', DeviceController.getAllDevices);

// Get specific device with full detection history
router.get('/devices/:deviceId/history', DeviceController.getDeviceHistory);

// Get only active devices
router.get('/devices/active/list', DeviceController.getActiveDevices);

module.exports = router;
