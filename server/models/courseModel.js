const { sdk, databases } = require('../config/appwrite');
const { Query, ID } = require('node-appwrite');

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'main';
const COLLECTION_ID = 'courses';

const CourseModel = {
    async setupDatabase() {
        try {
            await databases.getCollection(DATABASE_ID, COLLECTION_ID);
        } catch (error) {
            console.log('Creating Courses Collection...');
            await databases.createCollection(DATABASE_ID, COLLECTION_ID, 'Courses');
        }

        // Helper to safe create attribute
        const createAvailableAttribute = async (method, key, ...args) => {
            try {
                await databases[method](DATABASE_ID, COLLECTION_ID, key, ...args);
            } catch (error) {
                // Ignore if already exists (409)
                if (error.code !== 409) console.log(`Error creating attribute ${key}:`, error.message);
            }
        };

        await createAvailableAttribute('createStringAttribute', 'title', 255, true);
        await createAvailableAttribute('createStringAttribute', 'provider', 255, true);
        await createAvailableAttribute('createStringAttribute', 'category', 100, true);
        await createAvailableAttribute('createStringAttribute', 'url', 500, true);
        await createAvailableAttribute('createStringAttribute', 'thumbnail', 500, false);
        await createAvailableAttribute('createStringAttribute', 'description', 2000, false);
        await createAvailableAttribute('createStringAttribute', 'type', 50, true); // videocurso, guided
        await createAvailableAttribute('createStringAttribute', 'status', 50, true); // active, inactive
        await createAvailableAttribute('createStringAttribute', 'tags', 1000, false);
        await createAvailableAttribute('createStringAttribute', 'lessons', 5000, false);
        
        console.log('Courses Attributes verified.');
        await this.seedDemoData();
    },

    async seedDemoData() {
        try {
            console.log('Seeding Demo Courses...');
            const demoCourses = [
                {
                    title: "Mastering React Native Animations",
                    provider: "William Candillon",
// ... (rest of the object is fine, cutting for brevity in tool call if needed, but I should provide full context or just replace the logic block)
                    category: "React Native",
                    url: "https://www.youtube.com/watch?v=vzpmj8R2vO4",
                    thumbnail: "https://img.youtube.com/vi/vzpmj8R2vO4/maxresdefault.jpg",
                    description: "Learn how to create fluid 60fps animations using Reanimated 2 and 3. This course covers shared element transitions, gesture handlers, and complex physics-based interactions.",
                    type: "videocurso",
                    status: "active",
                    tags: "react-native,reanimated,mobile",
                    lessons: JSON.stringify([
                        { title: "Introduction to Shared Values", duration: "10:00" },
                        { title: "Interpolation & Extrapolation", duration: "15:00" },
                        { title: "Gesture Handler Integration", duration: "20:00" }
                    ])
                },
                {
                    title: "Node.js Advanced Patterns",
                    provider: "Matteo Collina",
                    category: "Backend",
                    url: "https://www.youtube.com/watch?v=M5F0e_2e4cw",
                    thumbnail: "https://img.youtube.com/vi/M5F0e_2e4cw/maxresdefault.jpg",
                    description: "Deep dive into Node.js streams, async iterators, and performance optimization techniques. Perfect for backend engineers looking to scale their applications.",
                    type: "videocurso",
                    status: "active",
                    tags: "nodejs,backend,performance",
                    lessons: JSON.stringify([
                        { title: "Streams in Depth", duration: "12:00" },
                        { title: "Async Hooks", duration: "18:00" }
                    ])
                },
                {
                    title: "System Design: WhatsApp",
                    provider: "ByteByteGo",
                    category: "System Design",
                    url: "https://www.youtube.com/watch?v=5lJ2n0wF7Dk",
                    thumbnail: "https://img.youtube.com/vi/5lJ2n0wF7Dk/maxresdefault.jpg",
                    description: "Learn how to design a scalable messaging system like WhatsApp. Covers websocket connections, database sharding, and message delivery guarantees.",
                    type: "videocurso",
                    status: "active",
                    tags: "system-design,scalability,architecture",
                    lessons: JSON.stringify([
                        { title: "Functional Requirements", duration: "5:00" },
                        { title: "Database Schema", duration: "10:00" },
                        { title: "Scaling Websockets", duration: "15:00" }
                    ])
                }
            ];

            for (const course of demoCourses) {
                 const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
                    Query.equal('title', course.title),
                    Query.limit(1)
                ]);
                
                if (existing.total === 0) {
                     await this.createCourse(course);
                     console.log(`Seeded course: ${course.title}`);
                }
            }
            console.log('Demo Courses check complete.');
        } catch (error) {
            console.log('Error seeding courses:', error);
        }
    },

    async listCourses(category) {
        const queries = [];
        if (category) {
            queries.push(Query.equal('category', category));
        }
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
        return response.documents;
    },

    async createCourse(data) {
        return await databases.createDocument(
            DATABASE_ID, 
            COLLECTION_ID, 
            ID.unique(), 
            data
        );
    },

    async updateCourse(id, data) {
        return await databases.updateDocument(
            DATABASE_ID, 
            COLLECTION_ID, 
            id, 
            data
        );
    },

    async deleteCourse(id) {
        return await databases.deleteDocument(
            DATABASE_ID, 
            COLLECTION_ID, 
            id
        );
    },

    async getCourse(id) {
        return await databases.getDocument(
            DATABASE_ID, 
            COLLECTION_ID, 
            id
        );
    }
};

module.exports = CourseModel;
