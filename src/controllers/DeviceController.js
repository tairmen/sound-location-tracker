const DeviceModel = require('../models/DeviceModel');
const SoundDetectionModel = require('../models/SoundDetectionModel');
const logger = require('../utils/logger');

class DeviceController {
    // Get all devices with their status and latest detection
    static async getAllDevices(req, res) {
        try {
            const devices = await DeviceModel.getAllDevicesWithStatus();

            logger.info(`📱 Devices list requested | Total: ${devices.length}`);

            res.status(200).json({
                success: true,
                count: devices.length,
                data: devices
            });
        } catch (error) {
            logger.error(`Error getting devices: ${error.message}`);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Get device with full detection history
    static async getDeviceHistory(req, res) {
        try {
            const { deviceId } = req.params;

            const data = await DeviceModel.getDeviceHistory(deviceId);

            if (!data.device) {
                return res.status(404).json({
                    success: false,
                    error: 'Device not found'
                });
            }

            // Get power history for each detection
            const detectionsWithHistory = await Promise.all(
                data.detections.map(async (detection) => {
                    const historyData = await SoundDetectionModel.getDetectionWithHistory(detection.id);
                    return {
                        ...detection,
                        powerHistory: historyData.powerHistory
                    };
                })
            );

            logger.info(`📊 Device history requested | Device: ${deviceId} | Detections: ${data.detections.length}`);

            res.status(200).json({
                success: true,
                data: {
                    device: data.device,
                    detections: detectionsWithHistory
                }
            });
        } catch (error) {
            logger.error(`Error getting device history: ${error.message}`);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Get only active devices
    static async getActiveDevices(req, res) {
        try {
            const devices = await DeviceModel.getActiveDevices();

            logger.info(`🟢 Active devices requested | Count: ${devices.length}`);

            res.status(200).json({
                success: true,
                count: devices.length,
                data: devices
            });
        } catch (error) {
            logger.error(`Error getting active devices: ${error.message}`);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}

module.exports = DeviceController;
