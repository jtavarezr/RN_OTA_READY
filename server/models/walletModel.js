const { databases, DATABASE_ID } = require('../config/appwrite');
const { Query, Permission, Role } = require('node-appwrite');
const logger = require('../utils/logger');

const COLLECTION_ID = 'wallets';

class WalletModel {
    static async setupDatabase() {
        try {
            try {
                await databases.getCollection(DATABASE_ID, COLLECTION_ID);
                logger.info(`✓ Collection ${COLLECTION_ID} found.`);
            } catch (error) {
                if (error.code === 404) {
                    logger.info(`Creating collection ${COLLECTION_ID}...`);
                    await databases.createCollection(DATABASE_ID, COLLECTION_ID, COLLECTION_ID, [
                        Permission.read(Role.any()), // Simplified for demo; ideally Role.user(userId)
                        Permission.write(Role.any())
                    ]);
                } else throw error;
            }

            const attributes = [
                { key: 'userId', type: 'string', size: 255, required: true },
                { key: 'balance', type: 'integer', required: true, default: 0 },
                { key: 'lastAdView', type: 'string', size: 255, required: false } // ISO String
            ];

            for (const attr of attributes) {
                try {
                    if (attr.type === 'string') {
                        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.size, attr.required, undefined, false);
                    } else if (attr.type === 'integer') {
                        await databases.createIntegerAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.required, 0, undefined);
                    }
                    logger.info(`+ Wallet Attribute: ${attr.key}`);
                    await new Promise(r => setTimeout(r, 100)); // Avoid rate limits
                } catch (e) {
                    if (e.code !== 409) logger.warn(`! Wallet Attr ${attr.key}: ${e.message}`);
                }
            }
        } catch (error) {
            logger.error('Wallet Setup Error:', error);
        }
    }

    static async getByUserId(userId) {
        try {
            // Because Appwrite Document ID = User ID is a good practice, we try that first
            // But if we want to query by userId field:
            const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
                Query.equal('userId', userId)
            ]);
            
            if (response.total > 0) {
                return response.documents[0];
            }
            return null;
        } catch (error) {
            logger.error(`Error getting wallet for ${userId}:`, error);
            return null;
        }
    }

    static async create(userId) {
        return await databases.createDocument(DATABASE_ID, COLLECTION_ID, 'unique()', {
            userId: userId,
            balance: 0,
            lastAdView: null
        });
    }

    static async updateBalance(documentId, newBalance, lastAdView = null) {
        const data = { balance: newBalance };
        if (lastAdView) data.lastAdView = lastAdView;
        
        return await databases.updateDocument(DATABASE_ID, COLLECTION_ID, documentId, data);
    }
}

module.exports = WalletModel;
