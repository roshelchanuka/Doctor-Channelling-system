import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../src/components/NotificationBell';
import './Dashboard.css';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [dashboardData, setDashboardData] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
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
            const response = await axios.get('http://localhost:8085/api/doctors', {
                headers: { Authorization: `Bearer ${tok}` }
            });
            setDoctors(response.data);
        } catch (err) {
            setError("Failed to load doctors. Please try logging in again.");
        } finally {
            setIsLoading(false);
        }
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
                    <div className="stat-card stat-blue">
                        <div className="stat-icon">📅</div>
                        <div className="stat-info">
                            <span className="stat-value">{upcoming.length}</span>
                            <span className="stat-label">Upcoming</span>
                        </div>
                    </div>
                    <div className="stat-card stat-green">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <span className="stat-value">{past.length}</span>
                            <span className="stat-label">Completed</span>
                        </div>
                    </div>
                    <div className="stat-card stat-purple">
                        <div className="stat-icon">👨‍⚕️</div>
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
                    <div className="quick-grid">
                        {navItems.filter(n => n.id !== 'home').map(item => (
                            <button
                                key={item.id}
                                className="quick-card"
                                onClick={() => setActiveTab(item.id)}
                            >
                                <span className="quick-icon">{item.icon}</span>
                                <span className="quick-label">{item.label}</span>
                            </button>
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

    const renderContent = () => {
        switch (activeTab) {
            case 'home': return renderHome();
            case 'profile': return renderProfile();
            case 'upcoming': return renderUpcoming();
            case 'past': return renderPast();
            case 'book': return renderBook();
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
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'nav-active' : ''}`}
                            onClick={() => { setActiveTab(item.id); setSelectedDoctor(null); setMessage(''); setError(''); }}
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
                </main>
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
