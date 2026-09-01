import axios from 'axios';

// Configure the default base URL if needed, though most components use absolute URLs currently.
// axios.defaults.baseURL = 'http://localhost:8085';

// Configure axios to always send cookies (withCredentials)
axios.defaults.withCredentials = true;

// Request Interceptor (No longer needs to attach Bearer token from localStorage)
axios.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Global Errors (like 401 Unauthorized)
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // The refresh token is now sent automatically via cookies
                await axios.post('http://localhost:8085/api/auth/refresh-token');
                // Retry original request, cookies will be sent automatically
                return axios(originalRequest);
            } catch (err) {
                console.warn("Refresh token failed. Redirecting to login.");
            }
            
            // Clear local user info
            localStorage.removeItem('userId');
            localStorage.removeItem('role');
            
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axios;
