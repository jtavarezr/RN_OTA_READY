const { databases, users, DATABASE_ID, COLLECTION_ID } = require('../config/appwrite');
const { Query, Permission, Role } = require('node-appwrite');
const logger = require('../utils/logger');

// --- DATA PACKING LOGIC ---
const PACKED_FIELDS = [
    'experience', 
    'education', 
    'projects', 
    'languages', 
    'certifications', 
    'volunteering', 
    'awards', 
    'links',
    // Fields that failed creation due to limits must be packed:
    'hobbies',
    'profilePicture',
    'bannerImage',
    'salaryExpectation'
];

const processProfileData = (data, direction = 'out') => {
    const processed = { ...data };

    if (direction === 'in') {
        // FRONTEND -> DATABASE
        const metadataObj = {};
        let hasMetadata = false;

        PACKED_FIELDS.forEach(field => {
            if (processed[field] !== undefined) {
                metadataObj[field] = processed[field];
                delete processed[field]; 
                hasMetadata = true;
            }
        });

        if (hasMetadata) {
            processed.metadata = JSON.stringify(metadataObj);
        }
    } 
    else if (direction === 'out') {
        // DATABASE -> FRONTEND
        
        // 1. Prioritize Metadata (New System)
        if (processed.metadata) {
            try {
                const unpacked = JSON.parse(processed.metadata);
                // Merge carefully: metadata overrides root fields
                Object.assign(processed, unpacked);
            } catch (e) {
                logger.warn("Failed to parse metadata JSON", { error: e.message, metadata: processed.metadata });
            }
            delete processed.metadata; 
        }

        // 2. SAFETY CHECK: Ensure types are correct to prevent frontend crashes.
        PACKED_FIELDS.forEach(field => {
            const val = processed[field];

            if (field === 'links') {
                // Must be Object
                if (!val || typeof val !== 'object' || Array.isArray(val)) {
                    processed[field] = {};
                }
            } else if (['hobbies', 'profilePicture', 'bannerImage', 'salaryExpectation'].includes(field)) {
                // Must be String (or null/undefined, but we default to empty string if needed or leave as is)
                // If it's not a string and not null, force string
                if (val && typeof val !== 'string') {
                    processed[field] = String(val);
                }
            } else {
                // Must be Array (experience, education, etc.)
                if (!Array.isArray(val)) {
                    // Try to parse if it's a JSON string (Migration fallback)
                    if (typeof val === 'string' && val.trim().startsWith('[')) {
                        try {
                            processed[field] = JSON.parse(val);
                        } catch {
                            processed[field] = [];
                        }
                    } else {
                        processed[field] = [];
                    }
                }
            }
        });
    }

    return processed;
};

class ProfileModel {
    static async setupDatabase() {
        logger.info('--- Database Setup (Optimized) ---');
        try {
            try {
                await databases.getCollection(DATABASE_ID, COLLECTION_ID);
                logger.info(`✓ Collection ${COLLECTION_ID} found.`);
            } catch (error) {
                if (error.code === 404) {
                    logger.info(`Creating collection ${COLLECTION_ID}...`);
                    await databases.createCollection(DATABASE_ID, COLLECTION_ID, COLLECTION_ID, [Permission.read(Role.any()), Permission.write(Role.users())]);
                } else throw error;
            }

            // Essential Indexed Attributes
            const attributes = [
                { name: 'fullName', type: 'string', size: 255 },
                { name: 'email', type: 'string', size: 255 },
                { name: 'headline', type: 'string', size: 255 },
                { name: 'city', type: 'string', size: 100 },
                { name: 'country', type: 'string', size: 100 },
                { name: 'profilePicture', type: 'string', size: 2048, required: false },
                { name: 'bannerImage', type: 'string', size: 2048, required: false },
                { name: 'hobbies', type: 'string', size: 2000, required: false },
                { name: 'salaryExpectation', type: 'string', size: 100, required: false },
                { name: 'skills', type: 'string', size: 2000, array: true },
                { name: 'completionPercentage', type: 'float' },
                { name: 'metadata', type: 'string', size: 1000000, required: false } 
            ];

            for (const attr of attributes) {
                try {
                    if (attr.type === 'string') {
                        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, attr.name, attr.size, attr.required || false, undefined, attr.array || false);
                    } else if (attr.type === 'float') {
                        await databases.createFloatAttribute(DATABASE_ID, COLLECTION_ID, attr.name, false);
                    }
                    logger.info(`+ Attribute: ${attr.name}`);
                    await new Promise(r => setTimeout(r, 100));
                } catch (e) {
                    // Ignore conflicts
                    if (e.code !== 409) logger.warn(`! Attr ${attr.name}: ${e.message}`);
                }
            }
            logger.info('--- Setup Complete ---');
        } catch (error) {
            logger.error('Setup Error:', error);
        }
    }

    static async getAll(limit = 25, offset = 0) {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(parseInt(limit)),
            Query.offset(parseInt(offset))
        ]);
        return {
            total: response.total,
            profiles: response.documents.map(d => processProfileData(d, 'out'))
        };
    }

    static async getById(userId) {
        try {
            const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, userId);
            return processProfileData(doc, 'out');
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    }

    static async createOrGet(userId) {
        let doc = await this.getById(userId);
        if (!doc) {
            const u = await users.get(userId);
            const initialData = {
                fullName: u.name || 'User',
                email: u.email,
                metadata: JSON.stringify({ experience: [], education: [] })
            };
            doc = await databases.createDocument(DATABASE_ID, COLLECTION_ID, userId, initialData);
            return processProfileData(doc, 'out');
        }
        return doc;
    }

    static async update(userId, data) {
        const cleanData = processProfileData(data, 'in');
        let response;
        try {
            await databases.getDocument(DATABASE_ID, COLLECTION_ID, userId);
            response = await databases.updateDocument(DATABASE_ID, COLLECTION_ID, userId, cleanData);
        } catch (error) {
            if (error.code === 404) {
                response = await databases.createDocument(DATABASE_ID, COLLECTION_ID, userId, cleanData);
            } else throw error;
        }
        return processProfileData(response, 'out');
    }

    static async patch(userId, newData) {
        const existingDoc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, userId).catch(() => null);
        
        let existingMetadata = {};
        if (existingDoc && existingDoc.metadata) {
            try { existingMetadata = JSON.parse(existingDoc.metadata); } catch {}
        }

        const newMetadata = {};
        PACKED_FIELDS.forEach(f => {
            if (newData[f] !== undefined) {
                newMetadata[f] = newData[f];
                delete newData[f]; 
            }
        });

        const finalMetadata = { ...existingMetadata, ...newMetadata };
        
        const payload = {
            ...newData, 
            metadata: JSON.stringify(finalMetadata)
        };

        let response;
        if (existingDoc) {
            response = await databases.updateDocument(DATABASE_ID, COLLECTION_ID, userId, payload);
        } else {
            response = await databases.createDocument(DATABASE_ID, COLLECTION_ID, userId, payload);
        }

        return processProfileData(response, 'out');
    }

    static async delete(userId) {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, userId);
    }
}

module.exports = ProfileModel;
