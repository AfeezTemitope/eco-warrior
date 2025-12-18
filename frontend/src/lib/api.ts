import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // console.log('🔐 API Request:', config.method?.toUpperCase(), config.url, {
    //     hasToken: !!token,
    //     token: token ? `${token.substring(0, 20)}...` : 'none'
    // });
    return config;
});

api.interceptors.response.use(
    (response) => {
        // console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
        return response;
    },
    (error) => {
        // console.error('❌ API Error:', {
        //     url: error.config?.url,
        //     status: error.response?.status,
        //     message: error.response?.data?.error || error.message,
        //     hasToken: !!localStorage.getItem('token')
        // });

        // Clear token if server says it's invalid or user not found
        if (error.response?.status === 401 && error.response?.data?.clearToken) {
            // console.log('🚪 Server says clear token - logging out');
            localStorage.removeItem('token');
            window.location.href = '/admin-login';
        }

        return Promise.reject(error);
    }
);

export default api;