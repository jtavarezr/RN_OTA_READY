const { databases } = require('../config/appwrite');
const { Query, ID } = require('node-appwrite');

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'main';
const COLLECTION_ID = 'questions';

const QuestionModel = {
    async setupDatabase() {
        try {
            await databases.getCollection(DATABASE_ID, COLLECTION_ID);
        } catch (error) {
            console.log('Creating Questions Collection...');
            await databases.createCollection(DATABASE_ID, COLLECTION_ID, 'Questions');
            
            // Attributes
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'text', 1000, true);
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'options', 2000, true); // JSON array of strings
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'correctAnswer', 500, true);
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'explanation', 1000, false);
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'category', 100, true);
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'difficulty', 50, true); // beginner, intermediate, advanced
            
            console.log('Questions Collection created successfully.');
        }
        await this.seedDemoData();
    },

    async seedDemoData() {
        try {
            console.log('Seeding Demo Questions...');
            const demoQuestions = [
                {
                    text: "What is the primary difference between `View` in React Native and `div` in standard HTML?",
// ... (cutting for brevity again, relying on context match)
                    options: JSON.stringify(["Use CSS Flexbox by default", "View has no default styling", "View renders to a native UI view", "View supports validation"]),
                    correctAnswer: "View renders to a native UI view",
                    explanation: "Unlike a div which renders to a generic HTML container, a View maps directly to the native UI container of the platform (UIView on iOS, android.view.View on Android).",
                    category: "React Native",
                    difficulty: "beginner"
                },
                {
                    text: "Which hook would you use to animate a value layout change in Reanimated?",
                    options: JSON.stringify(["useSharedValue", "useAnimatedStyle", "withLayoutAnimation", "Layout.springify()"]),
                    correctAnswer: "Layout.springify()",
                    explanation: "In Reanimated, Layout Animations are handled via the Layout prop, often using presets like Layout.springify() or Layout.linear().",
                    category: "React Native",
                    difficulty: "intermediate"
                },
                {
                    text: "In Node.js, what is the default size of the thread pool used by libuv?",
                    options: JSON.stringify(["1", "4", "8", "Unlimited"]),
                    correctAnswer: "4",
                    explanation: "By default, libuv uses a thread pool of 4 threads for handling I/O operations like file system access and DNS lookups.",
                    category: "Backend",
                    difficulty: "advanced"
                },
                {
                    text: "What is the Time Complexity of accessing an item in a Hash Map?",
                    options: JSON.stringify(["O(1)", "O(n)", "O(log n)", "O(n^2)"]),
                    correctAnswer: "O(1)",
                    explanation: "Hash Maps provide O(1) average time complexity for lookups because they use a hashing function to map keys to direct memory locations.",
                    category: "Computer Science",
                    difficulty: "beginner"
                }
            ];

            for (const q of demoQuestions) {
                const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
                    Query.equal('text', q.text),
                    Query.limit(1)
                ]);

                if (existing.total === 0) {
                     await this.createQuestion(q);
                     console.log(`Seeded question: ${q.text.substring(0, 30)}...`);
                }
            }
            console.log('Demo Questions check complete.');
        } catch (error) {
            console.log('Error seeding questions:', error);
        }
    },

    async listQuestions(category, difficulty) {
        const queries = [];
        if (category) queries.push(Query.equal('category', category));
        if (difficulty) queries.push(Query.equal('difficulty', difficulty));
        
        // Limit to 100 questions for now to avoid pagination complexity in MVP
        queries.push(Query.limit(100));

        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
        return response.documents;
    },

    async createQuestion(data) {
        return await databases.createDocument(
            DATABASE_ID, 
            COLLECTION_ID, 
            ID.unique(), 
            data
        );
    },
    
    async updateQuestion(id, data) {
         return await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            id,
            data
        );
    },

    async deleteQuestion(id) {
        return await databases.deleteDocument(
            DATABASE_ID,
            COLLECTION_ID,
            id
        );
    },
    
    async getQuestion(id) { // Added for edit functionality
        return await databases.getDocument(
            DATABASE_ID,
            COLLECTION_ID,
            id
        );
    },

    async listCategories() {
        // Appwrite doesn't support distinct, so we list all and filter
        // In a large dataset, this would need a separate collection but for MVP this works
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(100)]);
        const categories = [...new Set(response.documents.map(d => d.category))];
        return categories;
    }
};

module.exports = QuestionModel;
