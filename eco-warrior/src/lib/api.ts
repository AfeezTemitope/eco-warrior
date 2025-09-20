import axios from 'axios';
import { supabase } from './supabaseClient';

const baseURL = import.meta.env.VITE_API_URL;
if (!baseURL) {
    console.error('VITE_API_URL is not defined in the environment variables');
    throw new Error('Missing VITE_API_URL environment variable');
}

const api = axios.create({
    baseURL,
});

api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

export default api;