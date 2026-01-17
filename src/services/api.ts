import axios from 'axios';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://service.jobsprepai.com';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export default api;

