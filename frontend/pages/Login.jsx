import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; //  CSS file is linked.

const Login = () => {
    const [emailId, setEmailId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); //The page stops reloading.
        setError('');
        setSuccess('');

        try {
            //Sending data to the backend
            const response = await axios.post('http://localhost:8085/api/auth/login', {
                emailId: emailId,
                password: password
            });
            
            let data = response.data;
            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch(e) {}
            }
            
            // DEBUG: log the response to see what backend sends
            console.log('Login response data:', data);
            console.log('token:', data?.token, '| role:', data?.role, '| userId:', data?.userId);
            
            if (data && data.token) {
                localStorage.setItem('token', data.token);
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }
                if (data.userId) {
                    localStorage.setItem('userId', data.userId);
                }
                if (data.role) {
                    localStorage.setItem('role', data.role);
                }
                setSuccess('Login successful!');
                if (data.role && data.role.toUpperCase() === 'DOCTOR') {
                    navigate('/doctor-dashboard');
                } else if (data.role && data.role.toUpperCase() === 'ADMIN') {
                    navigate('/admin-dashboard');
                } else if (data.role && data.role.toUpperCase() === 'RECEPTIONIST') {
                    navigate('/receptionist-dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setSuccess(response.data);
            }
        } catch (err) {
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                if (typeof errorData === 'string') {
                    setError(errorData);
                } else if (errorData.error || errorData.message) {
                    setError(errorData.message || errorData.error);
                } else {
                    setError(JSON.stringify(errorData));
                }
            } else {
                setError("Login failed. Please try again.");
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Welcome Back</h2>
                <p>Login to Doctor Channelling System</p>

                {/* Displaying Errors or Success messages */}
                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            value={emailId} 
                            onChange={(e) => setEmailId(e.target.value)} 
                            placeholder="Enter your email"
                            required 
                        />
                    </div>
                    
                    <div className="input-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Enter your password"
                            required 
                        />
                        <div style={{ textAlign: 'right', marginTop: '8px' }}>
                            <a href="/forgot-password" style={{ fontSize: '13px', color: '#007bff', textDecoration: 'none' }}>Forgot Password?</a>
                        </div>
                    </div>

                    <button type="submit" className="login-btn">Login</button>
                </form>
                
                <div className="register-link">
                    Don't have an account? <a href="/register">Sign up here</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
