import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../src/components/NotificationBell';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'slots', 'appointments'
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [slots, setSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [reviews, setReviews] = useState([]);
    
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

    // For Medical Records
    const [recordModalOpen, setRecordModalOpen] = useState(false);
    const [selectedAppointmentForRecord, setSelectedAppointmentForRecord] = useState(null);
    const [recordForm, setRecordForm] = useState({
        diagnosis: '', symptoms: '', notes: '', prescriptions: []
    });
    const [newMedicine, setNewMedicine] = useState({
        medicineName: '', dosage: '', duration: '', instructions: ''
    });
    const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (!token || !userId || role?.toUpperCase() !== 'DOCTOR') {
            navigate('/login');
            return;
        }
        fetchDoctorProfile();
    }, [navigate]);

    useEffect(() => {
        if (doctorProfile) {
            if (activeTab === 'slots') fetchSlots();
            if (activeTab === 'appointments') fetchAppointments();
            if (activeTab === 'reviews') fetchReviews();
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

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`http://localhost:8085/api/reviews/doctor/${doctorProfile.doctorId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(response.data);
        } catch (err) {
            setError("Failed to load reviews.");
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

    const handleAddMedicine = () => {
        if (!newMedicine.medicineName || !newMedicine.dosage) return;
        setRecordForm(prev => ({
            ...prev,
            prescriptions: [...prev.prescriptions, newMedicine]
        }));
        setNewMedicine({ medicineName: '', dosage: '', duration: '', instructions: '' });
    };

    const handleRemoveMedicine = (index) => {
        setRecordForm(prev => {
            const updated = [...prev.prescriptions];
            updated.splice(index, 1);
            return { ...prev, prescriptions: updated };
        });
    };

    const handleRecordSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingRecord(true);
        setError('');
        try {
            await axios.post('http://localhost:8085/api/medical-records', {
                patientId: selectedAppointmentForRecord.patient.patientId,
                doctorId: doctorProfile.doctorId,
                appointmentId: selectedAppointmentForRecord.appointmentId,
                diagnosis: recordForm.diagnosis,
                symptoms: recordForm.symptoms,
                notes: recordForm.notes,
                prescriptions: recordForm.prescriptions
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Medical Record added successfully!');
            setRecordModalOpen(false);
            setSelectedAppointmentForRecord(null);
            setRecordForm({ diagnosis: '', symptoms: '', notes: '', prescriptions: [] });
        } catch (err) {
            setError('Failed to add medical record.');
        } finally {
            setIsSubmittingRecord(false);
        }
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
                    <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
                </div>
            </header>

            {isSidebarOpen && <div className="doctor-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

            <div className={`tabs-container ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-brand-mobile">
                    <h3>Menu</h3>
                    <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>✕</button>
                </div>
                <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => {setActiveTab('overview'); setIsSidebarOpen(false);}}>Overview</button>
                <button className={`tab-btn ${activeTab === 'slots' ? 'active' : ''}`} onClick={() => {setActiveTab('slots'); setIsSidebarOpen(false);}}>Manage Slots</button>
                <button className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => {setActiveTab('appointments'); setIsSidebarOpen(false);}}>Appointments</button>
                <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => {setActiveTab('reviews'); setIsSidebarOpen(false);}}>Reviews</button>
            </div>

            {message && <div className="success-msg animate-fade-in">{message}</div>}
            {error && <div className="error-msg animate-fade-in">{error}</div>}

            {activeTab === 'overview' && doctorProfile && (
                <div className="animate-fade-in" style={{ position: 'relative', marginBottom: '2rem' }}>
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
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginTop: 0, color: '#2b6cb0' }}>Add New Availability Slot</h3>
                        <form onSubmit={handleAddSlot} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '2rem', alignItems: 'end', marginTop: '1.5rem' }}>
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
                                    {app.appointmentStatus === 'Completed' && (
                                        <button 
                                            onClick={() => {
                                                setSelectedAppointmentForRecord(app);
                                                setRecordForm({ diagnosis: '', symptoms: '', notes: '', prescriptions: [] });
                                                setRecordModalOpen(true);
                                            }}
                                            style={{ width: '100%', marginTop: '1rem', background: '#3182ce', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            📝 Add Medical Record
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'reviews' && doctorProfile && (
                <div className="animate-fade-in">
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#2b6cb0' }}>Patient Reviews & Ratings</h3>
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#e0f2fe', borderRadius: '12px', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid #bae6fd' }}>
                        <span style={{ fontSize: '3rem' }}>⭐</span>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', lineHeight: '1.2' }}>{doctorProfile.averageRating || '0.0'} / 5.0</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '600', opacity: 0.8 }}>Based on {doctorProfile.totalReviews || 0} reviews</div>
                        </div>
                    </div>
                    {reviews.length === 0 ? <p style={{ color: '#64748b' }}>No reviews yet. As you complete appointments, patients can leave you feedback here.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {reviews.map(review => (
                                <div key={review.reviewId} className="card" style={{ padding: '1.5rem', borderLeft: '5px solid #f59e0b', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <strong style={{ fontSize: '1.15rem', color: '#1e293b' }}>{review.patient?.patientName || "Anonymous"}</strong>
                                        <span style={{ color: '#f59e0b', fontSize: '1.3rem', letterSpacing: '2px' }}>
                                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                        </span>
                                    </div>
                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                                        {new Date(review.reviewDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    <p style={{ margin: 0, color: '#334155', fontStyle: review.comment ? 'normal' : 'italic', lineHeight: '1.6' }}>
                                        {review.comment || "No comment provided."}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Medical Record Modal */}
            {recordModalOpen && selectedAppointmentForRecord && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: '#2b6cb0' }}>Add Medical Record</h3>
                            <button onClick={() => setRecordModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <p style={{ marginBottom: '1.5rem', color: '#4a5568' }}>
                            Patient: <strong>{selectedAppointmentForRecord.patient?.patientName}</strong><br/>
                            Date: {selectedAppointmentForRecord.appointmentDate}
                        </p>
                        
                        <form onSubmit={handleRecordSubmit}>
                            <div className="form-group">
                                <label>Diagnosis *</label>
                                <input type="text" value={recordForm.diagnosis} onChange={e => setRecordForm({...recordForm, diagnosis: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e0' }} />
                            </div>
                            <div className="form-group">
                                <label>Symptoms *</label>
                                <input type="text" value={recordForm.symptoms} onChange={e => setRecordForm({...recordForm, symptoms: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e0' }} />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea value={recordForm.notes} onChange={e => setRecordForm({...recordForm, notes: e.target.value})} rows="2" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e0' }}></textarea>
                            </div>

                            <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#2d3748', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Prescriptions</h4>
                            
                            {recordForm.prescriptions.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    {recordForm.prescriptions.map((med, index) => (
                                        <div key={index} style={{ background: '#f7fafc', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                                            <div>
                                                <strong>{med.medicineName}</strong> - {med.dosage} <br/>
                                                <span style={{ fontSize: '0.85rem', color: '#718096' }}>{med.duration} | {med.instructions}</span>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveMedicine(index)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Remove</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ background: '#ebf8ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px dashed #90cdf4' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Medicine Name *</label>
                                        <input type="text" value={newMedicine.medicineName} onChange={e => setNewMedicine({...newMedicine, medicineName: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Dosage *</label>
                                        <input type="text" placeholder="e.g. 1 pill 2x a day" value={newMedicine.dosage} onChange={e => setNewMedicine({...newMedicine, dosage: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Duration</label>
                                        <input type="text" placeholder="e.g. 5 days" value={newMedicine.duration} onChange={e => setNewMedicine({...newMedicine, duration: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Instructions</label>
                                        <input type="text" placeholder="e.g. After meals" value={newMedicine.instructions} onChange={e => setNewMedicine({...newMedicine, instructions: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }} />
                                    </div>
                                </div>
                                <button type="button" onClick={handleAddMedicine} style={{ background: '#3182ce', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>+ Add Medicine</button>
                            </div>

                            <button type="submit" disabled={isSubmittingRecord} style={{ width: '100%', background: '#48bb78', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                                {isSubmittingRecord ? 'Saving...' : 'Save Medical Record'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
