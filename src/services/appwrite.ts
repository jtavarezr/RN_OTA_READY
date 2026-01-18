import { Client, Account, ID, Databases } from 'appwrite';

const client = new Client();

const ENDPOINT =
  process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? 'https://appwrite.tavarez.dev/v1';

const PROJECT_ID =
  process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ?? '69629f6e001e3bb95b2f';

client.setEndpoint(ENDPOINT).setProject(PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export { ID };
export default client;
