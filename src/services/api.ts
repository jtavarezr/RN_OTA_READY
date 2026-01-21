import axios from 'axios';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://192.168.1.48:3030';

console.log('DEBUG: API BASE_URL:', BASE_URL); // Log URL to verify

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

export default api;

