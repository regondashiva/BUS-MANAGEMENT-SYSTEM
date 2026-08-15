// API Base URL Configuration
// In development, defaults to local Django backend at http://localhost:8000
// In production (Vercel/Render), uses the VITE_API_BASE_URL environment variable

const rawUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_BASE_URL = rawUrl.replace(/\/+$/, '');

export default API_BASE_URL;
