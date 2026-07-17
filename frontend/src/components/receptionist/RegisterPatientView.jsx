import React, { useState } from 'react';
import axios from 'axios';

const RegisterPatientView = ({ token, onSuccess }) => {
    const [patientName, setPatientName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [emailId, setEmailId] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
                setSuccess('Registration initiated. Please ask the patient for the OTP sent to their email.');
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
                // 2. Automatically Login to get userId and patient token for profile creation
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

                    setSuccess('Patient registered and verified successfully!');
                    
                    // Reset form
                    setTimeout(() => {
                        setPatientName('');
                        setMobileNumber('');
                        setEmailId('');
                        setPassword('');
                        setOtpCode('');
                        setIsOtpSent(false);
                        setSuccess('');
                        if (onSuccess) onSuccess();
                    }, 3000);
                } else {
                    setError("Account verified, but profile creation failed.");
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
        <div className="receptionist-form-container" style={{ padding: '0', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 24px 0', color: 'var(--receptionist-text-primary)', fontSize: '28px', fontWeight: 'bold' }}>
                {isOtpSent ? 'Verify Patient Account' : 'Register New Patient'}
            </h2>
            
            {error && <div style={{ color: 'var(--receptionist-error)', marginBottom: '16px', padding: '12px', background: 'rgba(255, 71, 87, 0.1)', borderRadius: '8px' }}>{error}</div>}
            {success && <div style={{ color: 'var(--receptionist-primary)', marginBottom: '16px', padding: '12px', background: 'rgba(11, 148, 116, 0.1)', borderRadius: '8px' }}>{success}</div>}

            {!isOtpSent ? (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: 'var(--receptionist-text-secondary)' }}>Full Name</label>
                        <input 
                            type="text" 
                            value={patientName} 
                            onChange={(e) => setPatientName(e.target.value)} 
                            placeholder="Enter patient full name"
                            required 
                            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--receptionist-border)', background: 'var(--receptionist-bg)', color: 'var(--receptionist-text-primary)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: 'var(--receptionist-text-secondary)' }}>Mobile Number</label>
                        <input 
                            type="tel" 
                            value={mobileNumber} 
                            onChange={(e) => setMobileNumber(e.target.value)} 
                            placeholder="Enter mobile number"
                            required 
                            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--receptionist-border)', background: 'var(--receptionist-bg)', color: 'var(--receptionist-text-primary)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: 'var(--receptionist-text-secondary)' }}>Email Address</label>
                        <input 
                            type="email" 
                            value={emailId} 
                            onChange={(e) => setEmailId(e.target.value)} 
                            placeholder="Enter email address"
                            required 
                            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--receptionist-border)', background: 'var(--receptionist-bg)', color: 'var(--receptionist-text-primary)' }}
                        />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: 'var(--receptionist-text-secondary)' }}>Temporary Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Create a temporary password"
                            required 
                            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--receptionist-border)', background: 'var(--receptionist-bg)', color: 'var(--receptionist-text-primary)' }}
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: '15px', marginTop: '8px' }}>Register Patient</button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: 'var(--receptionist-text-secondary)' }}>OTP Code</label>
                        <input 
                            type="text" 
                            value={otpCode} 
                            onChange={(e) => setOtpCode(e.target.value)} 
                            placeholder="Enter 6-digit OTP from patient's email"
                            required 
                            maxLength="6"
                            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--receptionist-border)', background: 'var(--receptionist-bg)', color: 'var(--receptionist-text-primary)' }}
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: '15px', marginTop: '8px' }}>Verify Account & Complete Registration</button>
                    
                    <button type="button" onClick={() => setIsOtpSent(false)} style={{ padding: '12px', fontSize: '15px', background: 'transparent', border: '1px solid var(--receptionist-border)', color: 'var(--receptionist-text-secondary)', borderRadius: '8px', cursor: 'pointer' }}>Cancel / Go Back</button>
                </form>
            )}
        </div>
    );
};

export default RegisterPatientView;
