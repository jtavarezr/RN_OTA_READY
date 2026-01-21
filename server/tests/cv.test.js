const request = require('supertest');
const app = require('../index');
const { Databases, Users } = require('node-appwrite');

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockImplementation(() => ({
                generateContent: jest.fn().mockResolvedValue({
                    response: {
                        text: () => JSON.stringify({
                            score: 85,
                            verdict: "Strong Candidate",
                            summary: "Test summary",
                            pros: ["Experience"],
                            cons: ["None"]
                        })
                    }
                })
            }))
        }))
    };
});

jest.mock('node-appwrite', () => {
    const mockDatabases = {
        getDocument: jest.fn(),
        createDocument: jest.fn(),
        updateDocument: jest.fn(),
        listDocuments: jest.fn(),
        getCollection: jest.fn(),
        createCollection: jest.fn(),
        createStringAttribute: jest.fn(),
        createIntegerAttribute: jest.fn(),
        createDatetimeAttribute: jest.fn(),
    };
    const mockUsers = {
        get: jest.fn()
    };
    return {
        Client: jest.fn().mockImplementation(() => ({
            setEndpoint: jest.fn().mockReturnThis(),
            setProject: jest.fn().mockReturnThis(),
            setKey: jest.fn().mockReturnThis(),
        })),
        Databases: jest.fn().mockImplementation(() => mockDatabases),
        Users: jest.fn().mockImplementation(() => mockUsers),
        ID: { unique: () => 'unique_id' },
        Query: {
            equal: (key, val) => `equal(${key},${val})`,
            orderDesc: (key) => `orderDesc(${key})`,
            limit: (val) => `limit(${val})`
        }
    };
});

describe('CV Compatibility API', () => {
    let mockDatabases;
    let mockUsers;

    beforeEach(() => {
        mockDatabases = new Databases();
        mockUsers = new Users();
        jest.clearAllMocks();
        
        // Mock middleware success
        mockUsers.get.mockResolvedValue({ $id: 'user123' });
    });

    describe('POST /api/cv/analyze', () => {
        it('should return 402 if balance is insufficient', async () => {
            // Mock Wallet Balance
            mockDatabases.listDocuments.mockImplementation((db, coll, queries) => {
                if (coll === 'wallets') return Promise.resolve({ total: 1, documents: [{ $id: 'w1', balance: 0 }] });
                if (coll === 'services') return Promise.resolve({ total: 1, documents: [{ slug: 'BASIC_REPORT', cost: 1 }] });
                return Promise.resolve({ total: 0, documents: [] });
            });

            const res = await request(app)
                .post('/api/cv/analyze')
                .send({
                    userId: 'user123',
                    jobTitle: 'Developer',
                    jobDescription: 'Need React dev',
                    resumeText: 'I am a React dev',
                    reportType: 'basic'
                });

            expect(res.statusCode).toBe(402);
            expect(res.body.error).toBe('Insufficient credits');
        });

        it('should process and return result if balance is OK', async () => {
            // Mock Wallet Balance & Service Price
            mockDatabases.listDocuments.mockImplementation((db, coll, queries) => {
                if (coll === 'wallets') return Promise.resolve({ total: 1, documents: [{ $id: 'w1', balance: 10 }] });
                if (coll === 'services') return Promise.resolve({ total: 1, documents: [{ slug: 'BASIC_REPORT', cost: 1 }] });
                return Promise.resolve({ total: 0, documents: [] });
            });

            mockDatabases.createDocument.mockResolvedValue({ $id: 'report1' });
            mockDatabases.updateDocument.mockResolvedValue({ $id: 'w1', balance: 9 });

            const res = await request(app)
                .post('/api/cv/analyze')
                .send({
                    userId: 'user123',
                    jobTitle: 'Developer',
                    jobDescription: 'Need React dev',
                    resumeText: 'I am a React dev',
                    reportType: 'basic'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.result).toBeDefined();
            expect(res.body.balance).toBe(9);
            expect(mockDatabases.createDocument).toHaveBeenCalled();
        });
    });

    describe('GET /api/cv/reports', () => {
        it('should return user reports', async () => {
            mockDatabases.listDocuments.mockResolvedValue({
                documents: [
                    { $id: 'r1', userId: 'user123', result: JSON.stringify({ score: 90 }) }
                ]
            });

            const res = await request(app).get('/api/cv/reports?userId=user123');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].result.score).toBe(90);
        });
    });
});
