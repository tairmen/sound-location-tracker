const SoundDetectionModel = require('../models/SoundDetectionModel');
const logger = require('../utils/logger');

class SoundDetectionController {
    // Endpoint 1: Initial sound detection
    static async startDetection(req, res) {
        try {
            const { deviceId, latitude, longitude, soundPower } = req.body;

            // Validate input
            if (!deviceId || latitude === undefined || longitude === undefined || soundPower === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: deviceId, latitude, longitude, soundPower'
                });
            }

            // Ensure device exists
            await SoundDetectionModel.ensureDevice(deviceId);

            // Check if device already has an active detection
            const existingDetection = await SoundDetectionModel.getActiveDetection(deviceId);
            if (existingDetection) {
                logger.warn(`Device ${deviceId} already has active detection (ID: ${existingDetection.id})`);
                return res.status(400).json({
                    success: false,
                    error: 'Device already has an active detection',
                    activeDetection: existingDetection
                });
            }

            // Create new detection
            const detection = await SoundDetectionModel.createDetection(
                deviceId,
                latitude,
                longitude,
                soundPower
            );

            logger.info(`🎵 NEW DETECTION | Device: ${deviceId} | Location: (${latitude}, ${longitude}) | Power: ${soundPower} dB | Detection ID: ${detection.id}`);

            res.status(201).json({
                success: true,
                message: 'Sound detection started',
                data: detection
            });
        } catch (error) {
            logger.error(`Error starting detection: ${error.message}`);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Endpoint 2: Update sound power during active detection
    static async updateSoundPower(req, res) {
        try {
            const { deviceId, soundPower } = req.body;

            // Validate input
            if (!deviceId || soundPower === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: deviceId, soundPower'
                });
            }

            // Get active detection for device
            const activeDetection = await SoundDetectionModel.getActiveDetection(deviceId);
            if (!activeDetection) {
                return res.status(404).json({
                    success: false,
                    error: 'No active detection found for this device'
                });
            }

            // Update sound power
            const updatedDetection = await SoundDetectionModel.updateSoundPower(
                activeDetection.id,
                soundPower
            );

            logger.info(`📊 POWER UPDATE | Device: ${deviceId} | Detection ID: ${activeDetection.id} | New Power: ${soundPower} dB`);

            res.status(200).json({
                success: true,
                message: 'Sound power updated',
                data: updatedDetection
            });
        } catch (error) {
            logger.error(`Error updating sound power: ${error.message}`);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Endpoint 3: End sound detection
    static async endDetection(req, res) {
        try {
            const { deviceId } = req.body;

            // Validate input
            if (!deviceId) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required field: deviceId'
                });
            }

            // Get active detection for device
            const activeDetection = await SoundDetectionModel.getActiveDetection(deviceId);
            if (!activeDetection) {
                return res.status(404).json({
                    success: false,
                    error: 'No active detection found for this device'
                });
            }

            // End detection
            const endedDetection = await SoundDetectionModel.endDetection(activeDetection.id);

            const duration = new Date(endedDetection.ended_at) - new Date(endedDetection.detected_at);
            const durationSeconds = (duration / 1000).toFixed(2);

            logger.info(`🔇 DETECTION ENDED | Device: ${deviceId} | Detection ID: ${activeDetection.id} | Duration: ${durationSeconds}s`);

            res.status(200).json({
                success: true,
                message: 'Sound detection ended',
                data: endedDetection
            });
        } catch (error) {
            logger.error(`Error ending detection: ${error.message}`);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Additional endpoint: Get all active detections (for monitoring)
    static async getActiveDetections(req, res) {
        try {
            const activeDetections = await SoundDetectionModel.getAllActiveDetections();

            logger.info(`📋 Active detections requested | Count: ${activeDetections.length}`);

            res.status(200).json({
                success: true,
                count: activeDetections.length,
                data: activeDetections
            });
        } catch (error) {
            logger.error(`Error getting active detections: ${error.message}`);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Additional endpoint: Get detection history
    static async getDetectionHistory(req, res) {
        try {
            const { detectionId } = req.params;

            const data = await SoundDetectionModel.getDetectionWithHistory(detectionId);

            if (!data.detection) {
                return res.status(404).json({
                    success: false,
                    error: 'Detection not found'
                });
            }

            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            logger.error(`Error getting detection history: ${error.message}`);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}

module.exports = SoundDetectionController;
