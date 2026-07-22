import axios from 'axios';

// Configure the default base URL if needed, though most components use absolute URLs currently.
// axios.defaults.baseURL = 'http://localhost:8085';

// Request Interceptor: Attach token if it exists
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
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
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token is expired or invalid
            console.warn("Unauthorized access detected (401). Clearing token and redirecting to login.");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login page if we are not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axios;
