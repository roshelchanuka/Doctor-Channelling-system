import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './CompleteProfile.css';

const CompleteProfile = () => {
    const [formData, setFormData] = useState({
        patientName: '',
        mobileNumber: '',
        city: '',
        age: '',
        medicalHistory: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    // Check if editing mode
    const isEditMode = location.state && location.state.editMode;
    const existingProfile = location.state && location.state.profile;

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) {
            navigate('/login');
        }

        if (isEditMode && existingProfile) {
            setFormData({
                patientName: existingProfile.patientName || '',
                mobileNumber: existingProfile.mobileNumber || '',
                city: existingProfile.city || '',
                age: existingProfile.age || '',
                medicalHistory: existingProfile.medicalHistory || ''
            });
        }
    }, [navigate, isEditMode, existingProfile]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        try {
            if (isEditMode) {
                await axios.put(`http://localhost:8085/api/patients/${userId}/profile`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`http://localhost:8085/api/patients/${userId}/profile`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            navigate('/dashboard');
        } catch (err) {
            console.error("Profile update failed:", err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError(`Failed to ${isEditMode ? 'update' : 'complete'} profile. Please try again.`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card animate-fade-in">
                <div className="profile-header">
                    <h2>{isEditMode ? 'Edit Profile' : 'Complete Your Profile'}</h2>
                    <p>{isEditMode ? 'Update your personal and medical information.' : 'Please provide your details to continue using our services.'}</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="profile-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="patientName">Full Name *</label>
                        <input
                            type="text"
                            id="patientName"
                            name="patientName"
                            value={formData.patientName}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="mobileNumber">Mobile Number *</label>
                        <input
                            type="text"
                            id="mobileNumber"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            required
                            placeholder="07X XXX XXXX"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label htmlFor="city">City</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Colombo"
                            />
                        </div>

                        <div className="form-group half-width">
                            <label htmlFor="age">Age</label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="30"
                                min="0"
                                max="150"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="medicalHistory">Medical History (Optional)</label>
                        <textarea
                            id="medicalHistory"
                            name="medicalHistory"
                            value={formData.medicalHistory}
                            onChange={handleChange}
                            placeholder="Any allergies, previous surgeries, or ongoing conditions..."
                            rows="4"
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        {isEditMode && (
                            <button 
                                type="button" 
                                className="cancel-btn" 
                                onClick={() => navigate('/dashboard')}
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            type="submit" 
                            className="submit-btn" 
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Complete Profile')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;
