const WalletModel = require('../models/walletModel');
const TransactionModel = require('../models/transactionModel');
const ServiceModel = require('../models/serviceModel');
const logger = require('../utils/logger');

// Simulated Ad Reward Amount
const CREDITS_PER_AD = 1; 

exports.getWallet = async (req, res) => {
    try {
        const userId = req.user ? req.user.$id : req.query.userId;
        if (!userId) {
            logger.warn('Get Wallet Failed: Missing userId');
            return res.status(400).json({ error: 'User ID required' });
        }

        logger.info(`Fetching wallet for user: ${userId}`);
        let wallet = await WalletModel.getByUserId(userId);
        if (!wallet) {
            logger.info(`Creating new wallet for user: ${userId}`);
            wallet = await WalletModel.create(userId);
        }

        res.json(wallet);
    } catch (error) {
        logger.error('Get Wallet Error:', error);
        res.status(500).json({ error: 'Internal User Error' });
    }
};

exports.addCredits = async (req, res) => {
    try {
        const userId = req.user ? req.user.$id : req.body.userId;
        const { adToken } = req.body;

        if (!userId) return res.status(400).json({ error: 'User ID required' });
        
        logger.info(`Attempting to add credits for user: ${userId}`);

        // server-side validation of adToken (Mock)
        if (!adToken || adToken !== 'VALID_AD_TOKEN') {
            logger.warn(`Invalid Ad Token for user ${userId}: ${adToken}`);
            return res.status(403).json({ error: 'Invalid or missing Ad Token' });
        }

        let wallet = await WalletModel.getByUserId(userId);
        if (!wallet) {
            wallet = await WalletModel.create(userId);
        }

        const newBalance = wallet.balance + CREDITS_PER_AD;
        await WalletModel.updateBalance(wallet.$id, newBalance, new Date().toISOString());
        await TransactionModel.create(userId, wallet.$id, CREDITS_PER_AD, 'EARN', 'Watched Rewarded Ad');

        logger.info(`Credits added for user ${userId}. New Balance: ${newBalance}`);
        res.json({ success: true, balance: newBalance, added: CREDITS_PER_AD });
    } catch (error) {
        logger.error('Add Credits Error:', error);
        res.status(500).json({ error: 'Transaction Failed' });
    }
};

exports.deductCredits = async (req, res) => {
    try {
        const userId = req.user ? req.user.$id : req.body.userId;
        const { amount, reason } = req.body;

        if (!userId) return res.status(400).json({ error: 'User ID required' });
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

        logger.info(`Attempting to deduct ${amount} credits for user ${userId} (Reason: ${reason})`);

        let wallet = await WalletModel.getByUserId(userId);
        if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

        if (wallet.balance < amount) {
            logger.warn(`Insufficient funds for user ${userId}. Balance: ${wallet.balance}, Required: ${amount}`);
            return res.status(402).json({ error: 'Insufficient funds', balance: wallet.balance, required: amount });
        }

        const newBalance = wallet.balance - amount;
        await WalletModel.updateBalance(wallet.$id, newBalance);
        await TransactionModel.create(userId, wallet.$id, amount, 'SPEND', reason || 'Service usage');

        logger.info(`Deduction successful for user ${userId}. New Balance: ${newBalance}`);
        res.json({ success: true, balance: newBalance });
    } catch (error) {
        logger.error('Deduct Credits Error:', error);
        res.status(500).json({ error: 'Transaction Failed' });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const userId = req.user ? req.user.$id : req.query.userId;
        if (!userId) return res.status(400).json({ error: 'User ID required' });

        const history = await TransactionModel.listByUserId(userId);
        res.json(history);
    } catch (error) {
        logger.error('Get Transactions Error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

exports.getPrices = async (req, res) => {
    try {
        const prices = await ServiceModel.getAllPrices();
        if (!prices) {
            // Fallback if DB fails? Or just empty object.
             logger.warn('Failed to fetch prices from DB, returning empty object or fallback.');
             return res.json({});
        }
        res.json(prices);
    } catch (error) {
        logger.error('Get Prices Error:', error);
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
};
