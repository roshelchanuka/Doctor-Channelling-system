import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import NotificationBell from '../src/components/NotificationBell';
import PatientChatView from '../src/components/patient/PatientChatView';
import './Dashboard.css';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [dashboardData, setDashboardData] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Search States
    const [searchName, setSearchName] = useState('');
    const [searchSpec, setSearchSpec] = useState('');
    const [searchCity, setSearchCity] = useState('');
    const [searchHospital, setSearchHospital] = useState('');

    // Review States
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewTargetDoctor, setReviewTargetDoctor] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!token || !userId) {
            navigate('/login');
            return;
        }
        setIsLoading(true);
        if (activeTab === 'home' || activeTab === 'profile' || activeTab === 'upcoming' || activeTab === 'past') {
            fetchDashboardData(userId, token);
        } else if (activeTab === 'book') {
            fetchDoctors(token);
        } else if (activeTab === 'records') {
            fetchMedicalRecords(userId, token);
        }
    }, [activeTab, navigate]);

    const fetchDashboardData = async (uid, tok) => {
        try {
            const response = await axios.get(`http://localhost:8085/api/patients/${uid}/dashboard`, {
                headers: { Authorization: `Bearer ${tok}` }
            });
            setDashboardData(response.data);
            setError('');
        } catch (err) {
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

    const fetchDoctors = async (tok) => {
        try {
            const params = new URLSearchParams();
            if (searchName) params.append('name', searchName);
            if (searchSpec) params.append('specialization', searchSpec);
            if (searchCity) params.append('city', searchCity);
            if (searchHospital) params.append('hospital', searchHospital);

            const endpoint = params.toString() ? `/api/doctors/search?${params.toString()}` : `/api/doctors`;

            const response = await axios.get(`http://localhost:8085${endpoint}`, {
                headers: { Authorization: `Bearer ${tok}` }
            });
            setDoctors(response.data);
        } catch (err) {
            setError("Failed to load doctors. Please try logging in again.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMedicalRecords = async (uid, tok) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`http://localhost:8085/api/medical-records/patient/${uid}`, {
                headers: { Authorization: `Bearer ${tok}` }
            });
            setMedicalRecords(response.data);
            setError('');
        } catch (err) {
            setError("Failed to load medical records.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDoctors(token);
    };

    const clearSearch = () => {
        setSearchName('');
        setSearchSpec('');
        setSearchCity('');
        setSearchHospital('');
        
        // Fetch all doctors again
        axios.get('http://localhost:8085/api/doctors', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setDoctors(res.data)).catch(err => setError("Failed to load doctors."));
    };

    const handleBookAppointment = async (slotId) => {
        const uid = localStorage.getItem('userId');
        if (!uid) { setError("Patient ID not found. Please log in again."); return; }
        setMessage(''); setError('');
        try {
            await axios.post('http://localhost:8085/api/appointments/book', {
                patientId: parseInt(uid, 10),
                slotId: slotId
            }, { headers: { Authorization: `Bearer ${token}` } });
            setMessage('Appointment booked successfully!');
            fetchDoctors(token);
            setSelectedDoctor(null);
            setTimeout(() => { setActiveTab('upcoming'); setMessage(''); }, 2000);
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
        localStorage.removeItem('role');
        navigate('/login');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const uid = localStorage.getItem('userId');
        const tok = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);
        try {
            await axios.post(`http://localhost:8085/api/upload/profile-picture/${uid}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${tok}` }
            });
            setMessage('Profile picture updated successfully!');
            fetchDashboardData(uid, tok);
        } catch (err) {
            setError('Failed to upload profile picture.');
        } finally {
            setUploading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const uid = localStorage.getItem('userId');
        if (!uid || !reviewTargetDoctor) return;
        
        setIsSubmittingReview(true);
        setError('');
        try {
            await axios.post('http://localhost:8085/api/reviews', {
                patientId: parseInt(uid, 10),
                doctorId: reviewTargetDoctor.doctorId,
                rating: parseInt(rating, 10),
                comment: comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Review submitted successfully!');
            setReviewModalOpen(false);
            setReviewTargetDoctor(null);
            setRating(5);
            setComment('');
        } catch (err) {
            setError('Failed to submit review.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const navItems = [
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'upcoming', label: 'Upcoming Appointments', icon: '📅' },
        { id: 'past', label: 'Past Appointments', icon: '📋' },
        { id: 'book', label: 'Book Appointment', icon: '➕' },
        { id: 'records', label: 'Medical Records', icon: '📝' },
        { id: 'chat', label: 'Live Chat', icon: '💬' },
    ];

    // ─── HOME PAGE ───────────────────────────────────────────────────────────
    const renderHome = () => {
        const profile = dashboardData?.profile;
        const upcoming = dashboardData?.upcomingAppointments || [];
        const past = dashboardData?.pastAppointments || [];

        if (isLoading) return <LoadingSpinner />;

        return (
            <div className="home-page animate-fade-in">
                {/* Hero greeting */}
                <div className="hero-greeting">
                    <div className="hero-text">
                        <p className="greeting-sub">{getGreeting()},</p>
                        <h1 className="greeting-name">
                            {profile?.patientName || 'Patient'} 👋
                        </h1>
                        <p className="greeting-desc">
                            Manage your health journey from your personal dashboard.
                        </p>
                        <button className="cta-book-btn" onClick={() => setActiveTab('book')}>
                            <span>➕</span> Book Appointment
                        </button>
                    </div>
                    <div className="hero-illustration">
                        <div className="hero-blob">
                            <span className="hero-icon-big">🏥</span>
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div className="stats-row">
                    <div className="stat-item">
                        <div className="stat-icon-text">📅</div>
                        <div className="stat-info">
                            <span className="stat-value">{upcoming.length}</span>
                            <span className="stat-label">Upcoming</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon-text">✅</div>
                        <div className="stat-info">
                            <span className="stat-value">{past.length}</span>
                            <span className="stat-label">Completed</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon-text">👨‍⚕️</div>
                        <div className="stat-info">
                            <span className="stat-value">{doctors.length || '—'}</span>
                            <span className="stat-label">Doctors</span>
                        </div>
                    </div>
                </div>

                {/* Next appointment highlight */}
                {upcoming.length > 0 && (
                    <div className="next-appt-card">
                        <div className="next-appt-label">
                            <span className="pulse-dot"></span> Next Appointment
                        </div>
                        <div className="next-appt-body">
                            <div className="next-appt-doctor">
                                <div className="doc-avatar">
                                    {upcoming[0].slot?.doctor?.doctorName?.[0] || 'D'}
                                </div>
                                <div>
                                    <h3>Dr. {upcoming[0].slot?.doctor?.doctorName}</h3>
                                    <p>{upcoming[0].slot?.doctor?.specialization}</p>
                                </div>
                            </div>
                            <div className="next-appt-details">
                                <div className="detail-chip">
                                    <span>📆</span> {upcoming[0].appointmentDate}
                                </div>
                                <div className="detail-chip">
                                    <span>🕐</span> {upcoming[0].slot?.startTime}
                                </div>
                                <div className="detail-chip">
                                    <span>#️⃣</span> Queue {upcoming[0].queueNumber}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick actions */}
                <div className="quick-actions">
                    <h3>Quick Actions</h3>
                    <div className="quick-links">
                        {navItems.filter(n => n.id !== 'home').map(item => (
                            <a
                                key={item.id}
                                href="#"
                                className="quick-link"
                                onClick={(e) => { e.preventDefault(); setActiveTab(item.id); }}
                            >
                                <span className="quick-icon">{item.icon}</span>
                                <span className="quick-label">{item.label}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // ─── PROFILE PAGE ─────────────────────────────────────────────────────────
    const renderProfile = () => {
        if (isLoading) return <LoadingSpinner />;
        if (!dashboardData) return <ErrorState error={error} navigate={navigate} />;

        const { profile, profileImageUrl } = dashboardData;

        return (
            <div className="page-section animate-fade-in">
                <div className="page-header">
                    <h2>My Profile</h2>
                    <p>Manage your personal information</p>
                </div>
                <div className="profile-main-card">
                    <div className="profile-avatar-section">
                        <div className="big-avatar">
                            {profileImageUrl ? (
                                <img src={`http://localhost:8085${profileImageUrl}`} alt="Profile" />
                            ) : (
                                <span>{profile?.patientName?.[0] || '👤'}</span>
                            )}
                            <div className="avatar-upload-overlay">
                                <input
                                    type="file"
                                    id="profile-upload"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                                <label htmlFor="profile-upload" className="upload-overlay-label">
                                    {uploading ? '⏳' : '📷'}
                                </label>
                            </div>
                        </div>
                        <h2 className="profile-name">{profile?.patientName}</h2>
                        <span className="profile-role-badge">Patient</span>
                    </div>

                    <div className="profile-info-grid">
                        <div className="info-item">
                            <span className="info-icon">📱</span>
                            <div>
                                <label>Mobile Number</label>
                                <p>{profile?.mobileNumber || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">🏙️</span>
                            <div>
                                <label>City</label>
                                <p>{profile?.city || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">🎂</span>
                            <div>
                                <label>Age</label>
                                <p>{profile?.age || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">🩸</span>
                            <div>
                                <label>Blood Group</label>
                                <p>{profile?.bloodGroup || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        className="edit-profile-btn"
                        onClick={() => navigate('/complete-profile', { state: { editMode: true, profile } })}
                    >
                        ✏️ Edit Profile
                    </button>
                </div>
            </div>
        );
    };

    // ─── UPCOMING APPOINTMENTS ────────────────────────────────────────────────
    const renderUpcoming = () => {
        if (isLoading) return <LoadingSpinner />;
        if (!dashboardData) return <ErrorState error={error} navigate={navigate} />;

        const appointments = dashboardData.upcomingAppointments || [];

        return (
            <div className="page-section animate-fade-in">
                <div className="page-header">
                    <h2>Upcoming Appointments</h2>
                    <p>Your scheduled consultations</p>
                </div>
                {appointments.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📭</span>
                        <h3>No Upcoming Appointments</h3>
                        <p>Book your first appointment with a doctor.</p>
                        <button className="cta-book-btn" onClick={() => setActiveTab('book')}>
                            Book Now
                        </button>
                    </div>
                ) : (
                    <div className="appointments-grid">
                        {appointments.map((app, index) => (
                            <div
                                key={app.appointmentId}
                                className="appt-card upcoming-card animate-fade-in-up"
                                style={{ animationDelay: `${index * 0.08}s` }}
                            >
                                <div className="appt-card-header">
                                    <div className="appt-doc-avatar">
                                        {app.slot?.doctor?.doctorName?.[0] || 'D'}
                                    </div>
                                    <div className="appt-doc-info">
                                        <h4>Dr. {app.slot?.doctor?.doctorName}</h4>
                                        <span className="appt-specialty">{app.slot?.doctor?.specialization}</span>
                                    </div>
                                    <span className="badge-upcoming">Upcoming</span>
                                </div>
                                <div className="appt-details-row">
                                    <div className="appt-detail">
                                        <span>📆</span>
                                        <div>
                                            <label>Date</label>
                                            <p>{app.appointmentDate}</p>
                                        </div>
                                    </div>
                                    <div className="appt-detail">
                                        <span>🕐</span>
                                        <div>
                                            <label>Time</label>
                                            <p>{app.slot?.startTime}</p>
                                        </div>
                                    </div>
                                    <div className="appt-detail">
                                        <span>#️⃣</span>
                                        <div>
                                            <label>Queue No</label>
                                            <p>{app.queueNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // ─── PAST APPOINTMENTS ────────────────────────────────────────────────────
    const renderPast = () => {
        if (isLoading) return <LoadingSpinner />;
        if (!dashboardData) return <ErrorState error={error} navigate={navigate} />;

        const appointments = dashboardData.pastAppointments || [];

        return (
            <div className="page-section animate-fade-in">
                <div className="page-header">
                    <h2>Past Appointments</h2>
                    <p>Your completed consultations history</p>
                </div>
                {appointments.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📋</span>
                        <h3>No Past Appointments</h3>
                        <p>Your appointment history will appear here.</p>
                    </div>
                ) : (
                    <div className="appointments-grid">
                        {appointments.map((app, index) => (
                            <div
                                key={app.appointmentId}
                                className="appt-card past-card animate-fade-in-up"
                                style={{ animationDelay: `${index * 0.08}s` }}
                            >
                                <div className="appt-card-header">
                                    <div className="appt-doc-avatar past-avatar">
                                        {app.slot?.doctor?.doctorName?.[0] || 'D'}
                                    </div>
                                    <div className="appt-doc-info">
                                        <h4>Dr. {app.slot?.doctor?.doctorName}</h4>
                                        <span className="appt-specialty">{app.slot?.doctor?.specialization}</span>
                                    </div>
                                    <span className="badge-completed">Completed</span>
                                </div>
                                <div className="appt-details-row">
                                    <div className="appt-detail">
                                        <span>📆</span>
                                        <div>
                                            <label>Date</label>
                                            <p>{app.appointmentDate}</p>
                                        </div>
                                    </div>
                                    <div className="appt-detail">
                                        <span>🕐</span>
                                        <div>
                                            <label>Time</label>
                                            <p>{app.slot?.startTime}</p>
                                        </div>
                                    </div>
                                    <div className="appt-detail">
                                        <button className="leave-review-btn" onClick={() => {
                                            setReviewTargetDoctor(app.slot.doctor);
                                            setRating(5);
                                            setComment('');
                                            setReviewModalOpen(true);
                                        }}>
                                            ⭐ Rate Doctor
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // ─── BOOK APPOINTMENT ─────────────────────────────────────────────────────
    const renderBook = () => {
        if (isLoading) return <LoadingSpinner />;

        return (
            <div className="page-section animate-fade-in">
                <div className="page-header">
                    <h2>Book Appointment</h2>
                    <p>Choose a doctor and select an available slot</p>
                </div>

                {!selectedDoctor ? (
                    <div>
                        <div className="advanced-search-panel">
                            <h3>🔍 Advanced Search</h3>
                            <form onSubmit={handleSearch} className="search-form-grid">
                                <input type="text" placeholder="Doctor Name (e.g. Silva)" value={searchName} onChange={e => setSearchName(e.target.value)} />
                                <input type="text" placeholder="Specialization (e.g. Cardiologist)" value={searchSpec} onChange={e => setSearchSpec(e.target.value)} />
                                <input type="text" placeholder="City (e.g. Colombo)" value={searchCity} onChange={e => setSearchCity(e.target.value)} />
                                <input type="text" placeholder="Hospital (e.g. Asiri)" value={searchHospital} onChange={e => setSearchHospital(e.target.value)} />
                                <div className="search-actions">
                                    <button type="submit" className="search-btn">Search</button>
                                    <button type="button" className="clear-btn" onClick={clearSearch}>Clear</button>
                                </div>
                            </form>
                        </div>

                        <h3 className="section-sub-title">Available Doctors</h3>
                        {doctors.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">👨‍⚕️</span>
                                <h3>No Doctors Available</h3>
                                <p>Please check back later.</p>
                            </div>
                        ) : (
                            <div className="doctors-grid">
                                {doctors.map((doc, index) => (
                                    <div
                                        key={doc.doctorId}
                                        className="doctor-card animate-fade-in-up"
                                        style={{ animationDelay: `${index * 0.08}s` }}
                                    >
                                        <div className="doctor-card-top">
                                            <div className="doctor-avatar-lg">
                                                {doc.doctorName?.[0] || 'D'}
                                            </div>
                                            <div className="doctor-info">
                                                <h4>Dr. {doc.doctorName}</h4>
                                                <span className="specialty-badge">{doc.specialization}</span>
                                                <div className="doc-rating-summary">
                                                    ⭐ {doc.averageRating || '0.0'} ({doc.totalReviews || 0} reviews)
                                                </div>
                                            </div>
                                        </div>
                                        <div className="doctor-card-body">
                                            <div className="fee-row">
                                                <span>💰</span>
                                                <span>LKR {doc.consultationFee}</span>
                                            </div>
                                            <div className="slots-count">
                                                <span>🗓️</span>
                                                <span>{doc.slots?.length || 0} slot(s) available</span>
                                            </div>
                                        </div>
                                        <button
                                            className="view-slots-btn"
                                            onClick={() => setSelectedDoctor(doc)}
                                        >
                                            View Slots →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="slots-view animate-fade-in">
                        <button className="back-nav-btn" onClick={() => setSelectedDoctor(null)}>
                            ← Back to Doctors
                        </button>
                        <div className="selected-doctor-info">
                            <div className="doctor-avatar-lg selected">
                                {selectedDoctor.doctorName?.[0] || 'D'}
                            </div>
                            <div>
                                <h3>Dr. {selectedDoctor.doctorName}</h3>
                                <span className="specialty-badge">{selectedDoctor.specialization}</span>
                            </div>
                        </div>

                        <h3 className="section-sub-title">Available Slots</h3>

                        {(!selectedDoctor.slots || selectedDoctor.slots.length === 0) ? (
                            <div className="empty-state">
                                <span className="empty-icon">🗓️</span>
                                <h3>No Slots Available</h3>
                                <p>This doctor has no available slots right now.</p>
                            </div>
                        ) : (
                            <div className="slots-grid">
                                {selectedDoctor.slots.map((slot, index) => {
                                    const isFull = slot.currentBooked >= slot.maxPatients;
                                    return (
                                        <div
                                            key={slot.slotId}
                                            className={`slot-card animate-fade-in-up ${isFull ? 'slot-full' : 'slot-available'}`}
                                            style={{ animationDelay: `${index * 0.08}s` }}
                                        >
                                            <div className="slot-date-badge">
                                                {slot.availableDate}
                                            </div>
                                            <div className="slot-time">
                                                🕐 {slot.startTime} – {slot.endTime}
                                            </div>
                                            <div className="slot-capacity">
                                                <div
                                                    className="capacity-bar"
                                                    style={{
                                                        '--fill': `${(slot.currentBooked / slot.maxPatients) * 100}%`,
                                                        '--color': isFull ? '#ef4444' : '#10b981'
                                                    }}
                                                >
                                                    <div className="capacity-fill"></div>
                                                </div>
                                                <span className={isFull ? 'cap-text-full' : 'cap-text-ok'}>
                                                    {isFull ? 'Fully Booked' : `${slot.maxPatients - slot.currentBooked} / ${slot.maxPatients} available`}
                                                </span>
                                            </div>
                                            <button
                                                className={`book-slot-btn ${isFull ? 'btn-full' : 'btn-book'}`}
                                                disabled={isFull}
                                                onClick={() => handleBookAppointment(slot.slotId)}
                                            >
                                                {isFull ? 'Fully Booked' : 'Book Now'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderRecords = () => {
        if (isLoading) return <LoadingSpinner />;

        return (
            <div className="page-section animate-fade-in">
                <div className="page-header">
                    <h2>Medical Records</h2>
                    <p>Your history of diagnosis and prescriptions</p>
                </div>
                {medicalRecords.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📂</span>
                        <h3>No Medical Records Found</h3>
                        <p>You don't have any medical records yet.</p>
                    </div>
                ) : (
                    <div className="records-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {medicalRecords.map((record, index) => (
                            <div 
                                key={record.recordId} 
                                className="record-card animate-fade-in-up" 
                                style={{ 
                                    animationDelay: `${index * 0.08}s`,
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    border: '1px solid #e2e8f0'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{record.diagnosis}</h3>
                                        <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            Dr. {record.doctor?.doctorName}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'right', color: '#64748b', fontSize: '0.9rem' }}>
                                        {new Date(record.recordDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h4 style={{ color: '#475569', margin: '0 0 0.5rem 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>Symptoms</h4>
                                        <p style={{ margin: 0, color: '#1e293b' }}>{record.symptoms}</p>
                                    </div>
                                    <div>
                                        <h4 style={{ color: '#475569', margin: '0 0 0.5rem 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>Notes</h4>
                                        <p style={{ margin: 0, color: '#1e293b' }}>{record.notes || 'None'}</p>
                                    </div>
                                </div>

                                {/* Prescriptions Sub-section */}
                                <div>
                                    <h4 style={{ color: '#2b6cb0', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>💊</span> Prescriptions
                                    </h4>
                                    {(!record.prescriptions || record.prescriptions.length === 0) ? (
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>No prescriptions provided.</p>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                            {record.prescriptions.map(p => (
                                                <div key={p.prescriptionId} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                                                    <h5 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1rem' }}>{p.medicineName}</h5>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: '#475569' }}>
                                                        <span><strong>Dosage:</strong> {p.dosage}</span>
                                                        <span><strong>Duration:</strong> {p.duration || 'N/A'}</span>
                                                        <span><strong>Instructions:</strong> {p.instructions || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'home': return renderHome();
            case 'profile': return renderProfile();
            case 'upcoming': return renderUpcoming();
            case 'past': return renderPast();
            case 'book': return renderBook();
            case 'records': return renderRecords();
            case 'chat': return <PatientChatView patientId={localStorage.getItem('userId')} token={localStorage.getItem('token')} />;
            default: return renderHome();
        }
    };

    return (
        <div className="dash-root">
            {/* ── SIDEBAR ── */}
            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="sidebar-brand">
                    <span className="brand-icon">🏥</span>
                    {sidebarOpen && <span className="brand-name">MediConnect</span>}
                    <button className="mobile-close-btn" onClick={() => setSidebarOpen(false)}>✖</button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'nav-active' : ''}`}
                            onClick={() => { 
                                setActiveTab(item.id); 
                                setSelectedDoctor(null); 
                                setMessage(''); 
                                setError(''); 
                                if (window.innerWidth <= 768) setSidebarOpen(false);
                            }}
                            title={!sidebarOpen ? item.label : ''}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {sidebarOpen && <span className="nav-label">{item.label}</span>}
                            {sidebarOpen && activeTab === item.id && (
                                <span className="nav-active-indicator"></span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-side-btn" onClick={handleLogout} title="Logout">
                        <span>🚪</span>
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ── MAIN PANEL ── */}
            <div className={`main-panel ${sidebarOpen ? 'panel-with-sidebar' : 'panel-collapsed'}`}>
                {/* Top bar */}
                <header className="top-bar">
                    <div className="top-bar-left">
                        <button
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle Sidebar"
                        >
                            {sidebarOpen ? '◀' : '▶'}
                        </button>
                        <div className="breadcrumb">
                            {navItems.find(n => n.id === activeTab)?.icon}{' '}
                            {navItems.find(n => n.id === activeTab)?.label}
                        </div>
                    </div>
                    <div className="top-bar-right">
                        <NotificationBell
                            userId={localStorage.getItem('userId')}
                            token={localStorage.getItem('token')}
                        />
                        <div className="user-chip">
                            <div className="user-chip-avatar">
                                {dashboardData?.profileImageUrl ? (
                                    <img src={`http://localhost:8085${dashboardData.profileImageUrl}`} alt="" />
                                ) : (
                                    <span>{dashboardData?.profile?.patientName?.[0] || '?'}</span>
                                )}
                            </div>
                            <span className="user-chip-name">
                                {dashboardData?.profile?.patientName?.split(' ')[0] || 'Patient'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Content area */}
                <main className="content-area">
                    {message && (
                        <div className="toast toast-success animate-fade-in">
                            ✅ {message}
                        </div>
                    )}
                    {error && (
                        <div className="toast toast-error animate-fade-in">
                            ⚠️ {error}
                        </div>
                    )}
                    {renderContent()}

                    {/* Review Modal */}
                    {reviewModalOpen && reviewTargetDoctor && (
                        <div className="modal-overlay" onClick={() => setReviewModalOpen(false)}>
                            <div className="modal-content review-modal" onClick={e => e.stopPropagation()}>
                                <button className="modal-close" onClick={() => setReviewModalOpen(false)}>×</button>
                                <h3>Rate Dr. {reviewTargetDoctor.doctorName}</h3>
                                <p>How was your experience?</p>
                                
                                <form onSubmit={handleReviewSubmit} className="review-form">
                                    <div className="rating-select">
                                        {[5, 4, 3, 2, 1].map(num => (
                                            <button 
                                                type="button" 
                                                key={num} 
                                                className={`star-btn ${rating >= num ? 'active' : ''}`}
                                                onClick={() => setRating(num)}
                                            >
                                                ★
                                            </button>
                                        )).reverse()}
                                    </div>
                                    <div className="rating-value-text">{rating} out of 5 stars</div>

                                    <div className="form-group">
                                        <label>Comment (Optional)</label>
                                        <textarea 
                                            rows="3" 
                                            placeholder="Write your feedback here..." 
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                        ></textarea>
                                    </div>

                                    <button type="submit" className="submit-review-btn" disabled={isSubmittingReview}>
                                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                </main>
                
                {/* Footer area */}
                <footer className="dashboard-footer">
                    <p>&copy; {new Date().getFullYear()} Doctor Channelling System. All rights reserved. | <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link></p>
                </footer>
            </div>
        </div>
    );
};

// ── Helper Components ────────────────────────────────────────────────────────
const LoadingSpinner = () => (
    <div className="loading-screen">
        <div className="spinner-ring"></div>
        <p>Loading...</p>
    </div>
);

const ErrorState = ({ error, navigate }) => (
    <div className="error-screen animate-fade-in">
        {error?.includes('profile') ? (
            <>
                <span className="error-icon">📝</span>
                <h3>Profile Incomplete</h3>
                <p>Please complete your patient profile to use the dashboard.</p>
                <button className="cta-book-btn" onClick={() => navigate('/complete-profile')}>
                    Complete Profile
                </button>
            </>
        ) : (
            <>
                <span className="error-icon">⚠️</span>
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button className="cta-book-btn" onClick={() => window.location.reload()}>
                    Retry
                </button>
            </>
        )}
    </div>
);

export default Dashboard;
