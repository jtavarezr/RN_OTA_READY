const { Databases, ID, Query } = require('node-appwrite');
const { client, DATABASE_ID } = require('../config/appwrite');
const logger = require('../utils/logger');

const COLLECTION_ID = 'services';

const databases = new Databases(client);

const ServiceModel = {
    setupDatabase: async () => {
        try {
            await databases.getCollection(DATABASE_ID, COLLECTION_ID);
            logger.info(`✓ Collection ${COLLECTION_ID} found.`);
            // Ensure defaults exist even if collection exists
            await ServiceModel.seedDefaults();
        } catch (error) {
            if (error.code === 404) {
                logger.info(`Creating collection ${COLLECTION_ID}...`);
                await databases.createCollection(DATABASE_ID, COLLECTION_ID, COLLECTION_ID);
                
                // Create Attributes
                await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'slug', 50, true);
                await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'name', 100, true);
                await databases.createIntegerAttribute(DATABASE_ID, COLLECTION_ID, 'cost', true);
                
                logger.info(`+ Service Attributes created.`);
                
                // Wait for attributes to be created before seeding
                await new Promise(resolve => setTimeout(resolve, 2000));
                await ServiceModel.seedDefaults();
            } else {
                logger.error(`Error checking collection ${COLLECTION_ID}:`, error);
            }
        }
    },

    seedDefaults: async () => {
        const defaults = [
            { slug: 'BASIC_REPORT', name: 'Reporte Básico', cost: 1 },
            { slug: 'ADVANCED_REPORT', name: 'Reporte Avanzado', cost: 2 },
            { slug: 'OPTIMIZED_GENERATION', name: 'Generación Optimizada (Pro)', cost: 20 },
            { slug: 'AI_IMPROVEMENT', name: 'Mejora con IA', cost: 1 },
            { slug: 'AI_COACH_INTERACTION', name: 'Consulta Coach IA', cost: 1 }
        ];

        for (const service of defaults) {
            try {
                // Check if exists
                const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
                    Query.equal('slug', service.slug)
                ]);

                if (existing.total === 0) {
                    await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), service);
                    logger.info(`+ Seeded service: ${service.slug} (${service.cost} credits)`);
                }
            } catch (error) {
                logger.error(`Error seeding service ${service.slug}:`, error);
            }
        }
    },

    getAllPrices: async () => {
        try {
            const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
            // Transform to object { SLUG: cost }
            const prices = {};
            result.documents.forEach(doc => {
                prices[doc.slug] = doc.cost;
            });
            return prices;
        } catch (error) {
            logger.error('Error fetching all prices:', error);
            return null;
        }
    },

    getPrice: async (slug) => {
        try {
            const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
                Query.equal('slug', slug)
            ]);
            if (result.total > 0) {
                return result.documents[0].cost;
            }
            return null;
        } catch (error) {
            logger.error(`Error fetching price for ${slug}:`, error);
            return null;
        }
    }
};

module.exports = ServiceModel;
