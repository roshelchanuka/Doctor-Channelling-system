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
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post('http://localhost:8085/api/auth/refresh-token', { refreshToken });
                    const newAccessToken = response.data.token;
                    localStorage.setItem('token', newAccessToken);
                    
                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axios(originalRequest);
                }
            } catch (err) {
                console.warn("Refresh token failed. Clearing tokens and redirecting to login.");
            }
            
            // Token is expired or invalid, and refresh failed or didn't exist
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
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
