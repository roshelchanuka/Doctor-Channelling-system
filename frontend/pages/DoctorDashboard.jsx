import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../src/components/NotificationBell';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'slots', 'appointments'
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [slots, setSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    
    // For updating profile if it doesn't exist
    const [profileForm, setProfileForm] = useState({ doctorName: '', specialization: '', consultationFee: '' });
    const [isProfileMissing, setIsProfileMissing] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [uploading, setUploading] = useState(false);

    // For new slot
    const [newSlot, setNewSlot] = useState({
        availableDate: '',
        startTime: '',
        endTime: '',
        maxPatients: 10
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (!token || !userId || role !== 'DOCTOR') {
            navigate('/login');
            return;
        }
        fetchDoctorProfile();
    }, [navigate]);

    useEffect(() => {
        if (doctorProfile) {
            if (activeTab === 'slots') fetchSlots();
            if (activeTab === 'appointments') fetchAppointments();
        }
    }, [activeTab, doctorProfile]);

    const fetchDoctorProfile = async () => {
        try {
            const response = await axios.get(`http://localhost:8085/api/doctors/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Handle new response map: { doctor, profileImageUrl }
            if (response.data && response.data.doctor) {
                setDoctorProfile(response.data.doctor);
                setProfileImageUrl(response.data.profileImageUrl);
            } else {
                // Fallback for any old API structure just in case
                setDoctorProfile(response.data);
            }
            setIsProfileMissing(false);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setIsProfileMissing(true);
            } else {
                setError("Failed to load doctor profile.");
            }
        }
    };

    const fetchSlots = async () => {
        try {
            const response = await axios.get(`http://localhost:8085/api/slots/doctor/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSlots(response.data);
        } catch (err) {
            setError("Failed to load slots.");
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`http://localhost:8085/api/appointments/doctor/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(response.data);
        } catch (err) {
            setError("Failed to load appointments.");
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError(''); setMessage('');
        try {
            const payload = {
                doctorId: parseInt(userId, 10),
                doctorName: profileForm.doctorName,
                specialization: profileForm.specialization,
                consultationFee: parseFloat(profileForm.consultationFee)
            };
            
            let response;
            if (isEditingProfile) {
                response = await axios.put(`http://localhost:8085/api/doctors/${doctorProfile.doctorId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Profile updated successfully!");
                setIsEditingProfile(false);
            } else {
                response = await axios.post('http://localhost:8085/api/doctors', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage("Profile saved successfully!");
                setIsProfileMissing(false);
            }
            setDoctorProfile(response.data);
        } catch (err) {
            setError("Failed to save profile. Please check the details.");
        }
    };

    const handleEditProfileClick = () => {
        setProfileForm({
            doctorName: doctorProfile.doctorName,
            specialization: doctorProfile.specialization,
            consultationFee: doctorProfile.consultationFee
        });
        setIsEditingProfile(true);
    };

    const handleAddSlot = async (e) => {
        e.preventDefault();
        setError(''); setMessage('');
        try {
            await axios.post(`http://localhost:8085/api/slots/doctor/${userId}`, newSlot, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Slot added successfully!");
            fetchSlots();
            setNewSlot({ availableDate: '', startTime: '', endTime: '', maxPatients: 10 });
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("Failed to add slot.");
            }
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm("Are you sure you want to delete this slot?")) return;
        setError(''); setMessage('');
        try {
            await axios.delete(`http://localhost:8085/api/slots/${slotId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Slot deleted successfully!");
            fetchSlots();
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("Failed to delete slot.");
            }
        }
    };

    const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
        setError(''); setMessage('');
        try {
            await axios.put(`http://localhost:8085/api/appointments/${appointmentId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(`Appointment marked as ${newStatus}!`);
            fetchAppointments();
        } catch (err) {
            setError("Failed to update appointment status.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await axios.post(`http://localhost:8085/api/upload/profile-picture/${userId}`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                }
            });
            setMessage('Profile picture updated successfully!');
            fetchDoctorProfile(); // Refresh
        } catch (err) {
            setError('Failed to upload profile picture.');
        } finally {
            setUploading(false);
        }
    };

    if (isProfileMissing || isEditingProfile) {
        return (
            <div className="doctor-dashboard-container animate-fade-in">
                <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: '#2b6cb0' }}>
                        {isEditingProfile ? 'Edit Your Profile' : 'Complete Your Doctor Profile'}
                    </h2>
                    {error && <div className="error-msg">{error}</div>}
                    <form onSubmit={handleProfileSubmit}>
                        <div className="form-group">
                            <label>Doctor Name (with Title)</label>
                            <input type="text" value={profileForm.doctorName} onChange={e => setProfileForm({...profileForm, doctorName: e.target.value})} required placeholder="e.g. Dr. John Doe" />
                        </div>
                        <div className="form-group">
                            <label>Specialization</label>
                            <input type="text" value={profileForm.specialization} onChange={e => setProfileForm({...profileForm, specialization: e.target.value})} required placeholder="e.g. Cardiologist" />
                        </div>
                        <div className="form-group">
                            <label>Consultation Fee (LKR)</label>
                            <input type="number" step="0.01" value={profileForm.consultationFee} onChange={e => setProfileForm({...profileForm, consultationFee: e.target.value})} required placeholder="e.g. 2500" />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="submit-btn" style={{ flex: 1, marginTop: 0 }}>
                                {isEditingProfile ? 'Update Profile' : 'Save Profile'}
                            </button>
                            {isEditingProfile && (
                                <button type="button" className="cancel-btn" style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e0', background: '#f7fafc', cursor: 'pointer', fontWeight: 'bold', color: '#4a5568' }} onClick={() => setIsEditingProfile(false)}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="doctor-dashboard-container animate-fade-in">
            <header className="dashboard-header">
                <h2>Doctor Dashboard</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <NotificationBell userId={userId} token={token} />
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <div className="tabs-container">
                <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                <button className={`tab-btn ${activeTab === 'slots' ? 'active' : ''}`} onClick={() => setActiveTab('slots')}>Manage Slots</button>
                <button className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>Appointments</button>
            </div>

            {message && <div className="success-msg animate-fade-in">{message}</div>}
            {error && <div className="error-msg animate-fade-in">{error}</div>}

            {activeTab === 'overview' && doctorProfile && (
                <div className="card animate-fade-in" style={{ position: 'relative' }}>
                    <h3 style={{ color: '#2b6cb0', marginTop: 0 }}>My Profile</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1rem' }}>
                        <div className="profile-picture" style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#e2e8f0', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {profileImageUrl ? (
                                <img src={`http://localhost:8085${profileImageUrl}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '2rem', color: '#a0aec0' }}>🧑‍⚕️</span>
                            )}
                        </div>
                        <div>
                            <input type="file" id="doctor-profile-upload" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
                            <label htmlFor="doctor-profile-upload" style={{ background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                {uploading ? 'Uploading...' : 'Upload Picture'}
                            </label>
                        </div>
                    </div>
                    <button 
                        className="edit-btn" 
                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#e2e8f0', color: '#4a5568', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={handleEditProfileClick}
                    >
                        Edit Profile
                    </button>
                    <p><strong>Name:</strong> {doctorProfile.doctorName}</p>
                    <p><strong>Specialization:</strong> {doctorProfile.specialization}</p>
                    <p><strong>Consultation Fee:</strong> LKR {doctorProfile.consultationFee}</p>
                </div>
            )}

            {activeTab === 'slots' && (
                <div className="animate-fade-in">
                    <div className="card">
                        <h3 style={{ marginTop: 0, color: '#2b6cb0' }}>Add New Availability Slot</h3>
                        <form onSubmit={handleAddSlot} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Date</label>
                                <input type="date" value={newSlot.availableDate} onChange={e => setNewSlot({...newSlot, availableDate: e.target.value})} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Start Time</label>
                                <input type="time" value={newSlot.startTime} onChange={e => setNewSlot({...newSlot, startTime: e.target.value})} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>End Time</label>
                                <input type="time" value={newSlot.endTime} onChange={e => setNewSlot({...newSlot, endTime: e.target.value})} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Max Patients</label>
                                <input type="number" min="1" value={newSlot.maxPatients} onChange={e => setNewSlot({...newSlot, maxPatients: parseInt(e.target.value, 10)})} required />
                            </div>
                            <button type="submit" className="submit-btn" style={{ marginTop: 0 }}>Add Slot</button>
                        </form>
                    </div>

                    <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Existing Slots</h3>
                    {slots.length === 0 ? <p>No slots found.</p> : (
                        <div className="grid">
                            {slots.map(slot => (
                                <div key={slot.slotId} className="card slot-card">
                                    <p><strong>Date:</strong> {slot.availableDate}</p>
                                    <p><strong>Time:</strong> {slot.startTime} - {slot.endTime}</p>
                                    <p><strong>Booked:</strong> {slot.currentBooked} / {slot.maxPatients}</p>
                                    <button 
                                        className="delete-btn" 
                                        onClick={() => handleDeleteSlot(slot.slotId)}
                                        disabled={slot.currentBooked > 0}
                                        title={slot.currentBooked > 0 ? "Cannot delete slot with existing appointments" : "Delete slot"}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'appointments' && (
                <div className="animate-fade-in">
                    <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>All Appointments</h3>
                    {appointments.length === 0 ? <p>No appointments booked yet.</p> : (
                        <div className="grid">
                            {appointments.map(app => (
                                <div key={app.appointmentId} className="card slot-card">
                                    <h4>{app.patient?.patientName}</h4>
                                    <p><strong>Date:</strong> {app.appointmentDate}</p>
                                    <p><strong>Slot Time:</strong> {app.slot?.startTime}</p>
                                    <p><strong>Queue No:</strong> {app.queueNumber}</p>
                                    <p>
                                        <strong>Status: </strong> 
                                        <span style={{ 
                                            padding: '0.2rem 0.5rem', 
                                            borderRadius: '4px', 
                                            background: app.appointmentStatus === 'Completed' ? '#c6f6d5' : app.appointmentStatus === 'Cancelled' ? '#fed7d7' : '#bee3f8',
                                            color: app.appointmentStatus === 'Completed' ? '#22543d' : app.appointmentStatus === 'Cancelled' ? '#9b2c2c' : '#2b6cb0',
                                            fontWeight: 'bold',
                                            fontSize: '0.85rem'
                                        }}>
                                            {app.appointmentStatus}
                                        </span>
                                    </p>
                                    {app.appointmentStatus === 'Scheduled' && (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                            <button 
                                                style={{ flex: 1, background: '#48bb78', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                onClick={() => handleUpdateAppointmentStatus(app.appointmentId, 'Completed')}
                                            >
                                                Complete
                                            </button>
                                            <button 
                                                style={{ flex: 1, background: '#f56565', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                onClick={() => handleUpdateAppointmentStatus(app.appointmentId, 'Cancelled')}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
