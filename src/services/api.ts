import axios from 'axios';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://192.168.1.48:3030';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export default api;

