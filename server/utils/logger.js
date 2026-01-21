const logger = {
    info: (message, meta = {}) => {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0]; // Cleaner time
        console.log(`🚀 [INFO] ${timestamp} - ${message}`, Object.keys(meta).length ? '\n' + JSON.stringify(meta, null, 2) : '');
    },
    error: (message, error) => {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        console.error(`❌ [ERROR] ${timestamp} - ${message}`);
        if (error) {
            if (error.response) {
                console.error('📦 Appwrite Detail:', JSON.stringify(error.response, null, 2));
            } else if (error.stack) {
                console.error(error.stack);
            } else {
                console.error('📝 Details:', error);
            }
        }
    },
    warn: (message, meta = {}) => {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        console.warn(`⚠️ [WARN] ${timestamp} - ${message}`, Object.keys(meta).length ? '\n' + JSON.stringify(meta, null, 2) : '');
    },
    debug: (message, meta = {}) => {
        if (process.env.NODE_ENV !== 'production') {
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            console.log(`🔍 [DEBUG] ${timestamp} - ${message}`, Object.keys(meta).length ? '\n' + JSON.stringify(meta, null, 2) : '');
        }
    }
};

module.exports = logger;
