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
                    await databases.createStringAttribute(DATABASE_ID, SESSIONS_COLLECTION, 'userId', 50, true);
                    await databases.createStringAttribute(DATABASE_ID, SESSIONS_COLLECTION, 'title', 100, false);
                    await databases.createDatetimeAttribute(DATABASE_ID, SESSIONS_COLLECTION, 'lastActive', true);
                    logger.info(`+ Session Attributes created.`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
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
                    await databases.createStringAttribute(DATABASE_ID, MESSAGES_COLLECTION, 'sessionId', 50, true);
                    await databases.createStringAttribute(DATABASE_ID, MESSAGES_COLLECTION, 'role', 10, true); // 'user' or 'model'
                    await databases.createStringAttribute(DATABASE_ID, MESSAGES_COLLECTION, 'content', 5000, true);
                    await databases.createDatetimeAttribute(DATABASE_ID, MESSAGES_COLLECTION, 'timestamp', true);
                    logger.info(`+ Message Attributes created.`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } catch (error) {
            logger.error('ChatModel Setup Error:', error);
        }
    },

    createSession: async (userId, title = 'New Conversation') => {
        return await databases.createDocument(DATABASE_ID, SESSIONS_COLLECTION, ID.unique(), {
            userId,
            title,
            lastActive: new Date().toISOString()
        });
    },

    listSessions: async (userId) => {
        return await databases.listDocuments(DATABASE_ID, SESSIONS_COLLECTION, [
            Query.equal('userId', userId),
            Query.orderDesc('lastActive')
        ]);
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
