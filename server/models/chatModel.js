const { Databases, ID, Query } = require('node-appwrite');
const { client, DATABASE_ID } = require('../config/appwrite');
const logger = require('../utils/logger');

const SESSIONS_COLLECTION = 'chat_sessions';
const MESSAGES_COLLECTION = 'chat_messages';

const databases = new Databases(client);

const ChatModel = {
    setupDatabase: async () => {
        try {
            // 1. Sessions Collection
            try {
                await databases.getCollection(DATABASE_ID, SESSIONS_COLLECTION);
                logger.info(`✓ Collection ${SESSIONS_COLLECTION} found.`);
            } catch (error) {
                if (error.code === 404) {
                    logger.info(`Creating collection ${SESSIONS_COLLECTION}...`);
                    await databases.createCollection(DATABASE_ID, SESSIONS_COLLECTION, SESSIONS_COLLECTION);
                } else throw error;
            }

            // Ensure attributes exist for Sessions
            const sessionAttrs = [
                { key: 'userId', type: 'string', size: 50, required: true },
                { key: 'title', type: 'string', size: 100, required: false },
                { key: 'lastActive', type: 'datetime', required: true },
                { key: 'interactionCount', type: 'integer', required: false, default: 0 },
                { key: 'maxInteractions', type: 'integer', required: false, default: 1 }
            ];

            for (const attr of sessionAttrs) {
                try {
                    if (attr.type === 'string') {
                        await databases.createStringAttribute(DATABASE_ID, SESSIONS_COLLECTION, attr.key, attr.size, attr.required);
                    } else if (attr.type === 'datetime') {
                        await databases.createDatetimeAttribute(DATABASE_ID, SESSIONS_COLLECTION, attr.key, attr.required);
                    } else if (attr.type === 'integer') {
                        await databases.createIntegerAttribute(DATABASE_ID, SESSIONS_COLLECTION, attr.key, attr.required, attr.default);
                    }
                    logger.info(`+ Session Attribute: ${attr.key}`);
                    await new Promise(r => setTimeout(r, 100));
                } catch (e) {
                    if (e.code !== 409) logger.warn(`! Session Attr ${attr.key}: ${e.message}`);
                }
            }

            // 2. Messages Collection
            try {
                await databases.getCollection(DATABASE_ID, MESSAGES_COLLECTION);
                logger.info(`✓ Collection ${MESSAGES_COLLECTION} found.`);
            } catch (error) {
                if (error.code === 404) {
                    logger.info(`Creating collection ${MESSAGES_COLLECTION}...`);
                    await databases.createCollection(DATABASE_ID, MESSAGES_COLLECTION, MESSAGES_COLLECTION);
                } else throw error;
            }

            // Ensure attributes exist for Messages
            const messageAttrs = [
                { key: 'sessionId', type: 'string', size: 50, required: true },
                { key: 'role', type: 'string', size: 10, required: true },
                { key: 'content', type: 'string', size: 5000, required: true },
                { key: 'timestamp', type: 'datetime', required: true }
            ];

            for (const attr of messageAttrs) {
                try {
                    if (attr.type === 'string') {
                        await databases.createStringAttribute(DATABASE_ID, MESSAGES_COLLECTION, attr.key, attr.size, attr.required);
                    } else if (attr.type === 'datetime') {
                        await databases.createDatetimeAttribute(DATABASE_ID, MESSAGES_COLLECTION, attr.key, attr.required);
                    }
                    logger.info(`+ Message Attribute: ${attr.key}`);
                    await new Promise(r => setTimeout(r, 100));
                } catch (e) {
                    if (e.code !== 409) logger.warn(`! Message Attr ${attr.key}: ${e.message}`);
                }
            }
        } catch (error) {
            logger.error('ChatModel Setup Error:', error);
        }
    },

    createSession: async (userId, title = 'New Conversation', maxInteractions = 1) => {
        return await databases.createDocument(DATABASE_ID, SESSIONS_COLLECTION, ID.unique(), {
            userId,
            title,
            lastActive: new Date().toISOString(),
            interactionCount: 0,
            maxInteractions
        });
    },

    listSessions: async (userId) => {
        return await databases.listDocuments(DATABASE_ID, SESSIONS_COLLECTION, [
            Query.equal('userId', userId),
            Query.orderDesc('lastActive')
        ]);
    },
    
    getSession: async (sessionId) => {
        try {
            return await databases.getDocument(DATABASE_ID, SESSIONS_COLLECTION, sessionId);
        } catch (error) {
            logger.error(`Error getting session ${sessionId}:`, error);
            return null;
        }
    },
    
    updateSessionInteractions: async (sessionId, count, maxInteractions = null) => {
        const data = { interactionCount: count };
        if (maxInteractions !== null) data.maxInteractions = maxInteractions;
        data.lastActive = new Date().toISOString();
        
        return await databases.updateDocument(DATABASE_ID, SESSIONS_COLLECTION, sessionId, data);
    },

    addMessage: async (sessionId, role, content) => {
        const timestamp = new Date().toISOString();
        // Update session lastActive
        // Note: In a real app we might do this async or let it fail silently
        try {
            await databases.updateDocument(DATABASE_ID, SESSIONS_COLLECTION, sessionId, { lastActive: timestamp });
        } catch (e) {
            logger.warn(`Failed to update session activity: ${sessionId}`);
        }

        return await databases.createDocument(DATABASE_ID, MESSAGES_COLLECTION, ID.unique(), {
            sessionId,
            role,
            content,
            timestamp
        });
    },

    getMessages: async (sessionId) => {
        const result = await databases.listDocuments(DATABASE_ID, MESSAGES_COLLECTION, [
            Query.equal('sessionId', sessionId),
            Query.orderAsc('timestamp'),
            Query.limit(100)
        ]);
        return result.documents;
    }
};

module.exports = ChatModel;
