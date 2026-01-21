const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const profileRoutes = require('./routes/profileRoutes');
const walletRoutes = require('./routes/walletRoutes');
const ProfileModel = require('./models/profileModel');
const WalletModel = require('./models/walletModel');
const TransactionModel = require('./models/transactionModel');
const ServiceModel = require('./models/serviceModel');
const CVModel = require('./models/cvModel');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- Swagger Config ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'OTA-EXPO User Profile API',
            version: '1.4.0',
            description: 'Bridge API with Metadata Packing and Full Documentation.',
        },
        servers: [{ url: `http://localhost:${process.env.PORT || 3030}` }],
        components: {
            schemas: {
                Experience: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, dates: { type: 'string' }, description: { type: 'string' }, isCurrent: { type: 'boolean' } } },
                Education: { type: 'object', properties: { degree: { type: 'string' }, institution: { type: 'string' }, dates: { type: 'string' } } },
                Project: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, tech: { type: 'string' }, link: { type: 'string' } } },
                Language: { type: 'object', properties: { name: { type: 'string' }, level: { type: 'string' } } },
                Certification: { type: 'object', properties: { name: { type: 'string' }, issuer: { type: 'string' }, year: { type: 'string' } } },
                Volunteering: { type: 'object', properties: { role: { type: 'string' }, organization: { type: 'string' } } },
                Award: { type: 'object', properties: { name: { type: 'string' }, issuer: { type: 'string' } } },
                Links: { type: 'object', properties: { github: { type: 'string' }, linkedin: { type: 'string' }, portfolio: { type: 'string' } } },
                UserProfile: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string' },
                        fullName: { type: 'string' },
                        email: { type: 'string' },
                        headline: { type: 'string' },
                        summary: { type: 'string' },
                        profilePicture: { type: 'string' },
                        bannerImage: { type: 'string' },
                        city: { type: 'string' },
                        country: { type: 'string' },
                        skills: { type: 'array', items: { type: 'string' } },
                        hobbies: { type: 'string' },
                        salaryExpectation: { type: 'string' },
                        experience: { type: 'array', items: { $ref: '#/components/schemas/Experience' } },
                        education: { type: 'array', items: { $ref: '#/components/schemas/Education' } },
                        projects: { type: 'array', items: { $ref: '#/components/schemas/Project' } },
                        languages: { type: 'array', items: { $ref: '#/components/schemas/Language' } },
                        certifications: { type: 'array', items: { $ref: '#/components/schemas/Certification' } },
                        volunteering: { type: 'array', items: { $ref: '#/components/schemas/Volunteering' } },
                        awards: { type: 'array', items: { $ref: '#/components/schemas/Award' } },
                        links: { $ref: '#/components/schemas/Links' },
                        completionPercentage: { type: 'number' }
                    }
                }
            }
        }
    },
    apis: ['./routes/*.js'], // Updated to point to routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Routes ---
const chatRoutes = require('./routes/chatRoutes');
const cvRoutes = require('./routes/cvRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ChatModel = require('./models/chatModel');
// ...
app.use('/api', profileRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/admin', adminRoutes);

// Admin UI Route
const path = require('path');
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start
const PORT = process.env.PORT || 3030;
if (process.env.NODE_ENV !== 'test') {
    Promise.all([
        ProfileModel.setupDatabase(),
        WalletModel.setupDatabase(),
        TransactionModel.setupDatabase(),
        ServiceModel.setupDatabase(),
        ChatModel.setupDatabase(),
        CVModel.setupDatabase()
    ]).then(() => {
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
            console.log(`Swagger at http://localhost:${PORT}/api-docs`);
        });
    });
}

module.exports = app;
