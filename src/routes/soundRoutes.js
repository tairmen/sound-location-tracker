const express = require('express');
const SoundDetectionController = require('../controllers/SoundDetectionController');

const router = express.Router();

// Endpoint 1: Start sound detection (when target sound is first detected)
router.post('/detection/start', SoundDetectionController.startDetection);

// Endpoint 2: Update sound power (while mobile continues detecting)
router.put('/detection/update', SoundDetectionController.updateSoundPower);

// Endpoint 3: End sound detection (when mobile stops detecting)
router.post('/detection/end', SoundDetectionController.endDetection);

// Additional endpoints for monitoring
router.get('/detections/active', SoundDetectionController.getActiveDetections);
router.get('/detection/:detectionId/history', SoundDetectionController.getDetectionHistory);

module.exports = router;
