const request = require('supertest');
const app = require('../index');
const { Client, Databases, Users } = require('node-appwrite');

// Mock node-appwrite
jest.mock('node-appwrite', () => {
    const mockDatabases = {
        getDocument: jest.fn(),
        createDocument: jest.fn(),
        updateDocument: jest.fn(),
        deleteDocument: jest.fn(),
        getCollection: jest.fn(),
        createCollection: jest.fn(),
        createStringAttribute: jest.fn(),
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
        Permission: { read: jest.fn(), write: jest.fn() },
        Role: { any: jest.fn(), users: jest.fn() }
    };
});

describe('Profile API', () => {
    let mockDatabases;
    let mockUsers;

    beforeEach(() => {
        // Reset mocks
        mockDatabases = new Databases();
        mockUsers = new Users();
        jest.clearAllMocks();
    });

    const mockProfile = {
        userId: 'user123',
        fullName: 'John Doe',
        email: 'john@example.com',
        headline: 'Developer',
        experience: JSON.stringify([{ title: 'Dev', company: 'Tech', dates: '2020' }])
    };

    describe('GET /api/profile/:userId', () => {
        it('should return profile if it exists', async () => {
            mockUsers.get.mockResolvedValue({ $id: 'user123' });
            mockDatabases.getDocument.mockResolvedValue(mockProfile);

            const res = await request(app).get('/api/profile/user123');

            expect(res.statusCode).toBe(200);
            expect(res.body.fullName).toBe('John Doe');
            expect(res.body.experience).toHaveLength(1);
        });

        it('should create default profile if not found', async () => {
            mockUsers.get.mockResolvedValue({ $id: 'user123', name: 'John Doe', email: 'john@example.com' });
            const notFoundError = new Error('Not Found');
            notFoundError.code = 404;
            mockDatabases.getDocument.mockRejectedValue(notFoundError);
            
            const newProfile = { ...mockProfile, fullName: 'John Doe' };
            mockDatabases.createDocument.mockResolvedValue(newProfile);

            const res = await request(app).get('/api/profile/user123');

            expect(res.statusCode).toBe(200);
            expect(mockDatabases.createDocument).toHaveBeenCalled();
        });

        it('should return 401 if user does not exist in Appwrite', async () => {
            mockUsers.get.mockRejectedValue(new Error('User not found'));
            
            const res = await request(app).get('/api/profile/unknownUser');
            
            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/profile', () => {
        it('should create profile if valid', async () => {
            mockUsers.get.mockResolvedValue({ $id: 'user123' });
            const notFoundError = new Error('Not Found');
            notFoundError.code = 404;
            mockDatabases.getDocument.mockRejectedValue(notFoundError);
            mockDatabases.createDocument.mockResolvedValue(mockProfile);

            const res = await request(app)
                .post('/api/profile')
                .send({
                    userId: 'user123',
                    fullName: 'John Doe',
                    email: 'john@example.com',
                    experience: [{ title: 'Dev', company: 'Tech', dates: '2020' }]
                });

            expect(res.statusCode).toBe(200);
            expect(mockDatabases.createDocument).toHaveBeenCalled();
        });

        it('should return 400 if validation fails', async () => {
            mockUsers.get.mockResolvedValue({ $id: 'user123' });

            const res = await request(app)
                .post('/api/profile')
                .send({
                    userId: 'user123',
                    email: 'invalid-email' // Invalid email
                });

            expect(res.statusCode).toBe(400);
        });
    });
});
