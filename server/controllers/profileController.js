const ProfileModel = require('../models/profileModel');
const logger = require('../utils/logger');

class ProfileController {
    static async getAllProfiles(req, res) {
        try {
            const { limit, offset } = req.query;
            logger.info(`Fetching profiles with limit=${limit}, offset=${offset}`);
            const result = await ProfileModel.getAll(limit, offset);
            res.json(result);
        } catch (e) {
            logger.error('Error fetching profiles', e);
            res.status(500).json({ error: e.message });
        }
    }

    static async getProfile(req, res) {
        try {
            const { userId } = req.params;
            logger.info(`Fetching profile for user: ${userId}`);
            
            const profile = await ProfileModel.createOrGet(userId);
            res.json(profile);
        } catch (e) {
            if (e.code === 404) {
                logger.warn(`Profile not found for user: ${req.params.userId}`);
                return res.status(404).json({ error: "Profile not found." });
            }
            logger.error(`Error fetching profile for user ${req.params.userId}`, e);
            res.status(500).json({ error: e.message });
        }
    }

    static async createOrUpdateProfile(req, res) {
        try {
            const { userId, ...data } = req.body;
            logger.info(`Create/Update profile for user: ${userId}`, { dataKeys: Object.keys(data) });
            const profile = await ProfileModel.update(userId, data);
            res.json(profile);
        } catch (error) {
            logger.error(`Error creating/updating profile for user ${req.body.userId}`, error);
            res.status(500).json({ error: error.message });
        }
    }

    static async patchProfile(req, res) {
        try {
            const { userId } = req.params;
            const { userId: _, ...newData } = req.body;
            logger.info(`Patching profile for user: ${userId}`, { updatedFields: Object.keys(newData) });
            
            const profile = await ProfileModel.patch(userId, newData);
            res.json(profile);
        } catch (e) {
            logger.error(`Patch Error for user ${req.params.userId}`, e);
            res.status(500).json({ error: e.message });
        }
    }

    static async deleteProfile(req, res) {
        try {
            const { userId } = req.params;
            logger.info(`Deleting profile for user: ${userId}`);
            await ProfileModel.delete(userId);
            res.status(204).send();
        } catch (e) {
            logger.error(`Error deleting profile for user ${req.params.userId}`, e);
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = ProfileController;
