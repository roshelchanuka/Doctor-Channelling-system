import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
    const [patientName, setPatientName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [emailId, setEmailId] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('http://localhost:8085/api/auth/register', {
                emailId: emailId,
                passwordHash: password,
                role: 'Patient'
            });
            
            if (response.data && response.data.includes('successfully')) {
                setSuccess(response.data);
                setIsOtpSent(true);
            } else {
                setError(response.data);
            }
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data);
            } else {
                setError("Registration failed. Please try again.");
            }
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            // 1. Verify OTP
            const verifyRes = await axios.post('http://localhost:8085/api/auth/verify', {
                emailId: emailId,
                otpCode: otpCode
            });
            
            if (verifyRes.data && verifyRes.data.includes('successfully')) {
                // 2. Automatically Login to get userId and token
                const loginRes = await axios.post('http://localhost:8085/api/auth/login', {
                    emailId: emailId,
                    password: password
                });
                
                let data = loginRes.data;
                if (typeof data === 'string') {
                    try { data = JSON.parse(data); } catch(err) {}
                }

                if (data && data.userId && data.token) {
                    // 3. Create Patient Profile
                    await axios.post(`http://localhost:8085/api/patients/${data.userId}/profile`, {
                        patientName: patientName,
                        mobileNumber: mobileNumber
                    }, {
                        headers: {
                            Authorization: `Bearer ${data.token}`
                        }
                    });

                    setSuccess('Account verified and profile created successfully! Redirecting...');
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } else {
                    setError("Account verified, but profile creation failed. Please login to complete profile.");
                    setTimeout(() => navigate('/login'), 3000);
                }
            } else {
                setError(verifyRes.data);
            }
        } catch (err) {
            if (err.response && err.response.data) {
                if (typeof err.response.data === 'string') {
                    setError(err.response.data);
                } else if (err.response.data.error) {
                    setError(err.response.data.error);
                } else {
                    setError("Verification failed.");
                }
            } else {
                setError("Verification or profile creation failed. Please try again.");
            }
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>{isOtpSent ? 'Verify Account' : 'Create Account'}</h2>
                <p>{isOtpSent ? 'Enter the OTP sent to your email' : 'Join Doctor Channelling System'}</p>

                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}

                {!isOtpSent ? (
                    <form onSubmit={handleRegister}>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                value={patientName} 
                                onChange={(e) => setPatientName(e.target.value)} 
                                placeholder="Enter your full name"
                                required 
                            />
                        </div>

                        <div className="input-group">
                            <label>Mobile Number</label>
                            <input 
                                type="tel" 
                                value={mobileNumber} 
                                onChange={(e) => setMobileNumber(e.target.value)} 
                                placeholder="Enter your mobile number"
                                required 
                            />
                        </div>

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
                                placeholder="Create a password"
                                required 
                            />
                        </div>

                        <button type="submit" className="register-btn">Register</button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="input-group">
                            <label>OTP Code</label>
                            <input 
                                type="text" 
                                value={otpCode} 
                                onChange={(e) => setOtpCode(e.target.value)} 
                                placeholder="Enter 6-digit OTP"
                                required 
                                maxLength="6"
                            />
                        </div>

                        <button type="submit" className="verify-btn">Verify Account</button>
                    </form>
                )}
                
                {!isOtpSent && (
                    <div className="login-link">
                        Already have an account? <a href="/login">Login here</a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
