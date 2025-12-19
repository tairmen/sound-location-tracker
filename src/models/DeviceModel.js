const pool = require('../database/db');

class DeviceModel {
    // Get all devices with their latest detection information
    static async getAllDevicesWithStatus() {
        const query = `
            SELECT 
                d.device_id,
                d.created_at as device_created_at,
                sd.id as detection_id,
                sd.latitude,
                sd.longitude,
                sd.sound_power,
                sd.detected_at,
                sd.ended_at,
                sd.is_active,
                sd.updated_at
            FROM devices d
            LEFT JOIN LATERAL (
                SELECT *
                FROM sound_detections
                WHERE device_id = d.device_id
                ORDER BY detected_at DESC
                LIMIT 1
            ) sd ON true
            ORDER BY d.device_id
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    // Get device with all its detection history
    static async getDeviceHistory(deviceId) {
        const deviceQuery = `
            SELECT * FROM devices WHERE device_id = $1
        `;
        
        const detectionsQuery = `
            SELECT * FROM sound_detections
            WHERE device_id = $1
            ORDER BY detected_at DESC
        `;
        
        const device = await pool.query(deviceQuery, [deviceId]);
        const detections = await pool.query(detectionsQuery, [deviceId]);
        
        return {
            device: device.rows[0],
            detections: detections.rows
        };
    }

    // Get active devices only (currently detecting)
    static async getActiveDevices() {
        const query = `
            SELECT 
                d.device_id,
                sd.id as detection_id,
                sd.latitude,
                sd.longitude,
                sd.sound_power,
                sd.detected_at,
                sd.is_active
            FROM devices d
            INNER JOIN sound_detections sd ON d.device_id = sd.device_id
            WHERE sd.is_active = TRUE
            ORDER BY sd.detected_at DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }
}

module.exports = DeviceModel;
