import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../src/components/NotificationBell';
import './Dashboard.css';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'book'
    const [dashboardData, setDashboardData] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // DEBUG: log what's in localStorage on mount
    console.log('[Dashboard] token:', localStorage.getItem('token'));
    console.log('[Dashboard] userId:', localStorage.getItem('userId'));
    console.log('[Dashboard] role:', localStorage.getItem('role'));

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        console.log('[Dashboard] useEffect - token:', token, '| userId:', userId, '| activeTab:', activeTab);
        if (!token || !userId) {
            console.log('[Dashboard] No token/userId - redirecting to login');
            navigate('/login');
            return;
        }
        
        setIsLoading(true);
        if (activeTab === 'overview') {
            fetchDashboardData(userId, token);
        } else if (activeTab === 'book') {
            fetchDoctors(token);
        }
    }, [activeTab, navigate]);

    const fetchDashboardData = async (userId, token) => {
        try {
            console.log('[Dashboard] Fetching dashboard for userId:', userId);
            // Note: Update the port if your backend is running on a different port than 8085
            const response = await axios.get(`http://localhost:8085/api/patients/${userId}/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('[Dashboard] Dashboard data received:', response.data);
            setDashboardData(response.data);
            setError('');
        } catch (err) {
            console.error('[Dashboard] Failed to fetch dashboard data', err);
            // It might fail with 404 if profile is not completed yet
            if (err.response && err.response.status === 404) {
                setError("Profile not found. Please complete your profile first.");
            } else if (err.code === 'ERR_NETWORK' || !err.response) {
                setError("Cannot connect to server. Is the backend running on port 8085?");
            } else {
                setError(`Failed to load dashboard data. (${err.response?.status})`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDoctors = async (token) => {
        try {
            const response = await axios.get('http://localhost:8085/api/doctors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctors(response.data);
        } catch (err) {
            console.error("Failed to fetch doctors", err);
            setError("Failed to load doctors. Please try logging in again.");
        } finally {
            setIsLoading(false);
        }

    };

    const handleBookAppointment = async (slotId) => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
            setError("Patient ID not found. Please log in again.");
            return;
        }

        setMessage('');
        setError('');

        try {
            await axios.post('http://localhost:8085/api/appointments/book', {
                patientId: parseInt(userId, 10),
                slotId: slotId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage('Appointment booked successfully!');
            fetchDoctors(token);
            setSelectedDoctor(null);
            
            // Switch back to overview to see the new appointment
            setTimeout(() => {
                setActiveTab('overview');
                setMessage('');
            }, 2000);
            
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("Failed to book appointment. Try again.");
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await axios.post(`http://localhost:8085/api/upload/profile-picture/${userId}`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                }
            });
            setMessage('Profile picture updated successfully!');
            fetchDashboardData(userId, token); // Refresh to get the new image URL
        } catch (err) {
            setError('Failed to upload profile picture.');
        } finally {
            setUploading(false);
        }
    };

    const renderOverview = () => {
        // Show loading spinner
        if (isLoading) {
            return (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--primary)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Loading dashboard...</p>
                </div>
            );
        }

        if (!dashboardData) {
            if (error && error.includes('profile')) {
                return (
                    <div className="overview-container animate-fade-in">
                        <div className="card profile-card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Profile Incomplete</h3>
                            <p style={{ marginBottom: '2rem' }}>Please complete your patient profile to view your dashboard and book appointments.</p>
                            <button 
                                className="tab-btn active" 
                                style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
                                onClick={() => navigate('/complete-profile')}
                            >
                                Complete Profile
                            </button>
                        </div>
                    </div>
                );
            }
            if (error) {
                return (
                    <div className="overview-container animate-fade-in">
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', border: '1px solid #ef4444', borderRadius: '16px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                            <h3 style={{ color: '#e53e3e' }}>Error Loading Dashboard</h3>
                            <p style={{ color: '#991b1b', fontWeight: 500 }}>{error}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                );
            }
            return (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text)' }}>
                    <p>No data available.</p>
                </div>
            );
        }
        
        const { profile, profileImageUrl, upcomingAppointments, pastAppointments, waitingList } = dashboardData;

        return (
            <div className="overview-container animate-fade-in">
                <div className="profile-card card" style={{ position: 'relative' }}>
                    <h3>My Profile</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1rem' }}>
                        <div className="profile-picture" style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#e2e8f0', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {profileImageUrl ? (
                                <img src={`http://localhost:8085${profileImageUrl}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '2rem', color: '#a0aec0' }}>👤</span>
                            )}
                        </div>
                        <div>
                            <input type="file" id="profile-upload" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
                            <label htmlFor="profile-upload" style={{ background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                {uploading ? 'Uploading...' : 'Upload Picture'}
                            </label>
                        </div>
                    </div>
                    <button 
                        className="edit-btn" 
                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#e2e8f0', color: '#4a5568', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={() => navigate('/complete-profile', { state: { editMode: true, profile } })}
                    >
                        Edit Profile
                    </button>
                    <p><strong>Name:</strong> {profile.patientName}</p>
                    <p><strong>Mobile:</strong> {profile.mobileNumber}</p>
                    <p><strong>City:</strong> {profile.city || 'N/A'}</p>
                    <p><strong>Age:</strong> {profile.age || 'N/A'}</p>
                </div>

                <div className="appointments-section">
                    <h3>Upcoming Appointments</h3>
                    {upcomingAppointments && upcomingAppointments.length > 0 ? (
                        <div className="grid">
                            {upcomingAppointments.map((app, index) => (
                                <div key={app.appointmentId} className="card slot-card animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <h4>Dr. {app.slot?.doctor?.doctorName}</h4>
                                    <p><strong>Date:</strong> {app.appointmentDate}</p>
                                    <p><strong>Time:</strong> {app.slot?.startTime}</p>
                                    <p><strong>Queue No:</strong> {app.queueNumber}</p>
                                    <span className="status-badge upcoming">Upcoming</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No upcoming appointments.</p>
                    )}
                </div>

                <div className="appointments-section mt-2">
                    <h3>Past Appointments</h3>
                    {pastAppointments && pastAppointments.length > 0 ? (
                        <div className="grid">
                            {pastAppointments.map((app, index) => (
                                <div key={app.appointmentId} className="card slot-card past animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <h4>Dr. {app.slot?.doctor?.doctorName}</h4>
                                    <p><strong>Date:</strong> {app.appointmentDate}</p>
                                    <p><strong>Time:</strong> {app.slot?.startTime}</p>
                                    <span className="status-badge past">Completed</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No past appointments.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderBooking = () => {
        return (
            <div className="booking-container animate-fade-in">
                {!selectedDoctor ? (
                    <div className="doctors-list">
                        <h3>Available Doctors</h3>
                        {doctors.length === 0 ? (
                            <p>No doctors available at the moment.</p>
                        ) : (
                            <div className="grid">
                                {doctors.map((doc, index) => (
                                    <div 
                                        key={doc.doctorId} 
                                        className="card doctor-card animate-fade-in-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <h4>Dr. {doc.doctorName}</h4>
                                        <p className="specialty">{doc.specialization}</p>
                                        <p className="fee">Fee: LKR {doc.consultationFee}</p>
                                        <button 
                                            className="select-btn"
                                            onClick={() => setSelectedDoctor(doc)}
                                        >
                                            View Slots
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="slots-list animate-fade-in">
                        <button className="back-btn" onClick={() => setSelectedDoctor(null)}>
                            &larr; Back to Doctors
                        </button>
                        <h3>Slots for Dr. {selectedDoctor.doctorName}</h3>
                        {(!selectedDoctor.slots || selectedDoctor.slots.length === 0) ? (
                            <p>No slots available for this doctor.</p>
                        ) : (
                            <div className="grid">
                                {selectedDoctor.slots.map((slot, index) => {
                                    const isFull = slot.currentBooked >= slot.maxPatients;
                                    return (
                                        <div 
                                            key={slot.slotId} 
                                            className={`card slot-card animate-fade-in-up ${isFull ? 'full' : ''}`}
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <p><strong>Date:</strong> {slot.availableDate}</p>
                                            <p><strong>Time:</strong> {slot.startTime} - {slot.endTime}</p>
                                            <p><strong>Available:</strong> {slot.maxPatients - slot.currentBooked} / {slot.maxPatients}</p>
                                            <button 
                                                className="book-btn"
                                                disabled={isFull}
                                                onClick={() => handleBookAppointment(slot.slotId)}
                                            >
                                                {isFull ? 'Fully Booked' : 'Book Now'}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>Patient Dashboard</h2>
                <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <NotificationBell userId={localStorage.getItem('userId')} token={localStorage.getItem('token')} />
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <div className="tabs-container">
                <button 
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`}
                    onClick={() => setActiveTab('book')}
                >
                    Book Appointment
                </button>
            </div>

            <div className="dashboard-content">
                {message && <div className="success-msg">{message}</div>}
                {error && <div className="error-msg">{error}</div>}

                {activeTab === 'overview' ? renderOverview() : renderBooking()}
            </div>
        </div>
    );
};

export default Dashboard;
