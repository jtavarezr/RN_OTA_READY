const { Users } = require('node-appwrite');
const logger = require('./utils/logger');

const validateSchema = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            const errorMessage = error.details.map((details) => details.message).join(', ');
            logger.warn(`Validation Error on ${req.method} ${req.originalUrl}`, { error: errorMessage, body: req.body });
            return res.status(400).json({ error: errorMessage });
        }
        req.validatedBody = value;
        next();
    };
};

const requireAuth = (client) => {
    const users = new Users(client);
    
    return async (req, res, next) => {
        // In a real scenario, we would verify a JWT token from the Authorization header.
        // For this bridge, we trust the userId passed in params or body, BUT we verify it exists in Appwrite.
        
        const userId = req.params.userId || req.body?.userId || req.query.userId;

        if (!userId) {
            logger.warn(`Auth Failed: No userId provided for ${req.originalUrl}`);
            return res.status(401).json({ error: 'Unauthorized: No userId provided' });
        }

        try {
            // Verify user exists
            await users.get(userId);
            logger.debug(`User verified: ${userId}`);
            next();
        } catch (error) {
            logger.error(`Auth check failed for user ${userId}`, error);
            return res.status(401).json({ error: 'Unauthorized: User does not exist or invalid credentials' });
        }
    };
};

module.exports = {
    validateSchema,
    requireAuth
};
