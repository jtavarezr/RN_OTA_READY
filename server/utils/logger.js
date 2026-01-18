const logger = {
    info: (message, meta = {}) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '');
    },
    error: (message, error) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
        if (error) {
            if (error.response) {
                // Appwrite specific error structure
                console.error('Appwrite Error:', JSON.stringify(error.response, null, 2));
            } else if (error.stack) {
                console.error(error.stack);
            } else {
                console.error(error);
            }
        }
    },
    warn: (message, meta = {}) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '');
    },
    debug: (message, meta = {}) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '');
        }
    }
};

module.exports = logger;
