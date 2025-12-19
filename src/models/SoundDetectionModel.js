const pool = require('../database/db');

class SoundDetectionModel {
    // Create or update device
    static async ensureDevice(deviceId) {
        const query = `
            INSERT INTO devices (device_id)
            VALUES ($1)
            ON CONFLICT (device_id) 
            DO UPDATE SET updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const result = await pool.query(query, [deviceId]);
        return result.rows[0];
    }

    // Create new sound detection
    static async createDetection(deviceId, latitude, longitude, soundPower) {
        const query = `
            INSERT INTO sound_detections 
            (device_id, latitude, longitude, sound_power, is_active)
            VALUES ($1, $2, $3, $4, TRUE)
            RETURNING *
        `;
        const result = await pool.query(query, [deviceId, latitude, longitude, soundPower]);
        return result.rows[0];
    }

    // Get active detection for a device
    static async getActiveDetection(deviceId) {
        const query = `
            SELECT * FROM sound_detections
            WHERE device_id = $1 AND is_active = TRUE
            ORDER BY detected_at DESC
            LIMIT 1
        `;
        const result = await pool.query(query, [deviceId]);
        return result.rows[0];
    }

    // Update sound power for active detection
    static async updateSoundPower(detectionId, soundPower) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Update the main detection record
            const updateQuery = `
                UPDATE sound_detections
                SET sound_power = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2 AND is_active = TRUE
                RETURNING *
            `;
            const updateResult = await client.query(updateQuery, [soundPower, detectionId]);

            // Record the power update in history
            const historyQuery = `
                INSERT INTO sound_power_updates (detection_id, sound_power)
                VALUES ($1, $2)
                RETURNING *
            `;
            await client.query(historyQuery, [detectionId, soundPower]);

            await client.query('COMMIT');
            return updateResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // End detection (mark as inactive)
    static async endDetection(detectionId) {
        const query = `
            UPDATE sound_detections
            SET is_active = FALSE, ended_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        const result = await pool.query(query, [detectionId]);
        return result.rows[0];
    }

    // Get all active detections (for monitoring)
    static async getAllActiveDetections() {
        const query = `
            SELECT sd.*, d.created_at as device_created_at
            FROM sound_detections sd
            JOIN devices d ON sd.device_id = d.device_id
            WHERE sd.is_active = TRUE
            ORDER BY sd.detected_at DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    // Get detection with power update history
    static async getDetectionWithHistory(detectionId) {
        const detectionQuery = `
            SELECT * FROM sound_detections WHERE id = $1
        `;
        const historyQuery = `
            SELECT * FROM sound_power_updates 
            WHERE detection_id = $1 
            ORDER BY recorded_at ASC
        `;
        
        const detection = await pool.query(detectionQuery, [detectionId]);
        const history = await pool.query(historyQuery, [detectionId]);
        
        return {
            detection: detection.rows[0],
            powerHistory: history.rows
        };
    }
}

module.exports = SoundDetectionModel;
