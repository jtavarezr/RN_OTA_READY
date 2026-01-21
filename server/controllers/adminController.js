const WalletModel = require('../models/walletModel');
const ServiceModel = require('../models/serviceModel');
const { databases, DATABASE_ID, users } = require('../config/appwrite');
const { Query } = require('node-appwrite');
const logger = require('../utils/logger');

exports.getDashboardData = async (req, res) => {
    logger.info(`📊 Admin Dashboard request received: page=${req.query.page}, search=${req.query.search}`);
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Fetch services
        logger.info('🔍 Fetching platform services...');
        const servicesResult = await databases.listDocuments(DATABASE_ID, 'services');
        
        // Simple listing for diagnostics
        logger.info('👥 Listing users from Appwrite...');
        const userList = await users.list();
        logger.info(`✅ Admin Dashboard DIAGNOSTIC: Found ${userList.total} users in total.`);
        
        const usersWithWallets = await Promise.all(userList.users.map(async (u) => {
            try {
                const wallet = await WalletModel.getByUserId(u.$id);
                return {
                    id: u.$id,
                    name: u.name,
                    email: u.email,
                    balance: wallet ? wallet.balance : 0,
                    status: u.status,
                    registration: u.registration || u.$createdAt
                };
            } catch (err) {
                logger.error(`Error mapping user ${u.$id}:`, err);
                return {
                    id: u.$id,
                    name: u.name,
                    email: u.email,
                    balance: 0,
                    status: u.status,
                    registration: u.registration || u.$createdAt
                };
            }
        }));

        const responseData = {
            services: servicesResult.documents || [],
            users: usersWithWallets || [],
            totalUsers: userList.total || 0,
            currentPage: parseInt(page),
            totalPages: Math.ceil((userList.total || 0) / parseInt(limit))
        };

        // logger.debug('Admin Dashboard Data:', responseData);
        res.json(responseData);
    } catch (error) {
        logger.error('Admin Dashboard Error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch dashboard data',
            services: [],
            users: [],
            totalUsers: 0,
            currentPage: 1,
            totalPages: 0
        });
    }
};

exports.updateUserDetails = async (req, res) => {
    try {
        const { userId, name, email } = req.body;
        if (name) await users.updateName(userId, name);
        if (email) await users.updateEmail(userId, email);
        res.json({ success: true, message: `User ${userId} updated` });
        logger.info(`👤 User updated: ${userId} (${name || 'no name change'})`);
    } catch (error) {
        logger.error('❌ Admin Update User Details Error:', error);
        res.status(500).json({ error: 'Failed to update user details' });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { userId, status } = req.body;
        // Appwrite uses a boolean for status in updateStatus
        await users.updateStatus(userId, status);
        res.json({ success: true, message: `User ${userId} status updated to ${status}` });
    } catch (error) {
        logger.error('Admin Update User Status Error:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

exports.updateWallet = async (req, res) => {
    try {
        const { userId, balance } = req.body;
        const wallet = await WalletModel.getByUserId(userId);
        if (!wallet) {
            await WalletModel.create(userId);
            const newWallet = await WalletModel.getByUserId(userId);
            await WalletModel.updateBalance(newWallet.$id, parseInt(balance));
        } else {
            await WalletModel.updateBalance(wallet.$id, parseInt(balance));
        }
        res.json({ success: true, message: `Wallet updated for ${userId}` });
        logger.info(`💰 Wallet updated for user ${userId}: new balance ${balance}`);
    } catch (error) {
        logger.error('❌ Admin Update Wallet Error:', error);
        res.status(500).json({ error: 'Failed to update wallet' });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { slug, cost, interactions } = req.body;
        const result = await databases.listDocuments(DATABASE_ID, 'services', [
            Query.equal('slug', slug)
        ]);
        
        if (result.total === 0) return res.status(404).json({ error: 'Service not found' });
        
        const serviceId = result.documents[0].$id;
        await databases.updateDocument(DATABASE_ID, 'services', serviceId, {
            cost: parseInt(cost),
            interactions: parseInt(interactions)
        });
        
        res.json({ success: true, message: `Service ${slug} updated` });
    } catch (error) {
        logger.error('Admin Update Service Error:', error);
        res.status(500).json({ error: 'Failed to update service' });
    }
};
