class Logger {
    static getTimestamp() {
        return new Date().toISOString();
    }

    static info(message) {
        console.log(`[${this.getTimestamp()}] ℹ️  INFO: ${message}`);
    }

    static warn(message) {
        console.log(`[${this.getTimestamp()}] ⚠️  WARN: ${message}`);
    }

    static error(message) {
        console.error(`[${this.getTimestamp()}] ❌ ERROR: ${message}`);
    }

    static success(message) {
        console.log(`[${this.getTimestamp()}] ✅ SUCCESS: ${message}`);
    }

    static debug(message) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${this.getTimestamp()}] 🐛 DEBUG: ${message}`);
        }
    }
}

module.exports = Logger;
