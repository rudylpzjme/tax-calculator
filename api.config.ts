import axios from 'axios';

if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL environment variable is not defined');
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});
