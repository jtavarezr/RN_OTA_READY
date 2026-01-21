const { Databases, ID, Query } = require('node-appwrite');
const { client, DATABASE_ID } = require('../config/appwrite');
const logger = require('../utils/logger');

// We use v1 to avoid row limit issues from previous iterations
const COLLECTION_ID = 'cv_analysis_v1';

const databases = new Databases(client);

const CVModel = {
    setupDatabase: async () => {
        try {
            try {
                await databases.getCollection(DATABASE_ID, COLLECTION_ID);
                logger.info(`✓ Collection ${COLLECTION_ID} found.`);
            } catch (error) {
                if (error.code === 404) {
                    logger.info(`Creating collection ${COLLECTION_ID}...`);
                    await databases.createCollection(DATABASE_ID, COLLECTION_ID, COLLECTION_ID);
                } else throw error;
            }

            // Ensure attributes exist with optimized sizes to fit MariaDB row limit (64KB)
            const attrs = [
                { key: 'userId', type: 'string', size: 50, required: true },
                { key: 'jobTitle', type: 'string', size: 255, required: false },
                { key: 'jobDescription', type: 'string', size: 2000, required: false },
                { key: 'resumeText', type: 'string', size: 2000, required: false },
                { key: 'reportType', type: 'string', size: 20, required: true },
                { key: 'result', type: 'string', size: 8000, required: true },
                { key: 'createdAt', type: 'datetime', required: true }
            ];

            // Verify existing attributes
            const collection = await databases.listAttributes(DATABASE_ID, COLLECTION_ID);
            const existingKeys = collection.attributes.map(a => a.key);
            
            for (const attr of attrs) {
                if (!existingKeys.includes(attr.key)) {
                    try {
                        if (attr.type === 'string') {
                            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.size, attr.required);
                        } else if (attr.type === 'datetime') {
                            await databases.createDatetimeAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.required);
                        }
                        logger.info(`+ CV Attribute created: ${attr.key}`);
                        // Wait for propagation
                        await new Promise(r => setTimeout(r, 2000));
                    } catch (e) {
                        logger.warn(`! CV Attr ${attr.key} Creation Error: ${e.message}`);
                    }
                }
            }
        } catch (error) {
            logger.error('CVModel Setup Error (v1):', error);
        }
    },

    saveReport: async (data) => {
        return await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
            ...data,
            createdAt: new Date().toISOString()
        });
    },

    listReports: async (userId) => {
        return await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('userId', userId),
            Query.orderDesc('createdAt'),
            Query.limit(20)
        ]);
    }
};

module.exports = CVModel;
