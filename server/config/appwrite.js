const { Client, Databases, Users } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://appwrite.tavarez.dev/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '69629f6e001e3bb95b2f')
    .setKey(process.env.APPWRITE_API_KEY || ''); 

const databases = new Databases(client);
const users = new Users(client);

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '696c08db00398c8aa9a1';
const COLLECTION_ID = process.env.APPWRITE_COLLECTION_ID || 'profiles';

module.exports = {
    client,
    databases,
    users,
    DATABASE_ID,
    COLLECTION_ID
};
