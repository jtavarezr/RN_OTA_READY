const { databases } = require('../config/appwrite');
const { Query, ID } = require('node-appwrite');

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'main';
const COLLECTION_ID = 'userProgress';

const ProgressModel = {
    async setupDatabase() {
        try {
            await databases.getCollection(DATABASE_ID, COLLECTION_ID);
        } catch (error) {
            console.log('Creating UserProgress Collection...');
            await databases.createCollection(DATABASE_ID, COLLECTION_ID, 'UserProgress');
            
            // Attributes
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'userId', 255, true);
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'courseId', 255, true);
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'completedLessons', 5000, false); // JSON array
            await databases.createIntegerAttribute(DATABASE_ID, COLLECTION_ID, 'percentage', false, 0, 100);
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'resumePoint', 1000, false); // Last active lesson ID or timestamp
            
            console.log('UserProgress Collection created successfully.');
        }
    },

    async getProgress(userId, courseId) {
        const queries = [
            Query.equal('userId', userId),
            Query.equal('courseId', courseId)
        ];
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
        if (response.documents.length > 0) {
            return response.documents[0];
        }
        return null; // No progress found
    },

    async updateProgress(userId, courseId, data) {
        const existing = await this.getProgress(userId, courseId);
        
        if (existing) {
            return await databases.updateDocument(
                DATABASE_ID, 
                COLLECTION_ID, 
                existing.$id, 
                data
            );
        } else {
            return await databases.createDocument(
                DATABASE_ID, 
                COLLECTION_ID, 
                ID.unique(), 
                {
                    userId,
                    courseId,
                    percentage: 0, // Default
                    ...data
                }
            );
        }
    },
    
    async listUserProgress(userId) {
         const queries = [
            Query.equal('userId', userId)
        ];
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
        return response.documents;
    }
};

module.exports = ProgressModel;
