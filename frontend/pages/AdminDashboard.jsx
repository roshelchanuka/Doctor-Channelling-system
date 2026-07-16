import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState({ users: 0, doctors: 0, patients: 0, appointments: 0 });
    const [users, setUsers] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [reviews, setReviews] = useState([]);
    
    // Report Preview State
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [reportPreview, setReportPreview] = useState(null); // { type: 'pdf' | 'excel', url: string }
    
    // Register Admin/Doctor Form
    const [adminForm, setAdminForm] = useState({ emailId: '', password: '', role: 'Admin' });
    const [adminFormMsg, setAdminFormMsg] = useState({ type: '', text: '' });

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token || role !== 'Admin') {
            navigate('/login');
            return;
        }

        fetchAllData();
    }, [navigate]);

    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const fetchAllData = async () => {
        try {
            const [usersRes, doctorsRes, patientsRes, appointmentsRes, reviewsRes] = await Promise.all([
                axios.get('http://localhost:8085/api/users', getHeaders()),
                axios.get('http://localhost:8085/api/doctors', getHeaders()),
                axios.get('http://localhost:8085/api/patients', getHeaders()),
                axios.get('http://localhost:8085/api/appointments', getHeaders()),
                axios.get('http://localhost:8085/api/reviews', getHeaders())
            ]);

            setUsers(usersRes.data || []);
            setDoctors(doctorsRes.data || []);
            setPatients(patientsRes.data || []);
            setAppointments(appointmentsRes.data || []);
            setReviews(reviewsRes.data || []);

            setStats({
                users: (usersRes.data || []).length,
                doctors: (doctorsRes.data || []).length,
                patients: (patientsRes.data || []).length,
                appointments: (appointmentsRes.data || []).length,
            });
        } catch (error) {
            console.error("Error fetching admin data:", error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`http://localhost:8085/api/users/${userId}`, getHeaders());
            fetchAllData();
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user");
        }
    };

    const handleToggleUserStatus = async (userId) => {
        try {
            await axios.put(`http://localhost:8085/api/users/${userId}/toggle-status`, {}, getHeaders());
            fetchAllData();
        } catch (error) {
            console.error("Error toggling user status:", error);
            alert("Failed to toggle user status");
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            await axios.delete(`http://localhost:8085/api/reviews/${reviewId}`, getHeaders());
            fetchAllData();
        } catch (error) {
            console.error("Error deleting review:", error);
            alert("Failed to delete review");
        }
    };

    const handleUpdateAppointment = async (appointmentId, status) => {
        try {
            await axios.put(`http://localhost:8085/api/appointments/${appointmentId}/status`, { status }, getHeaders());
            fetchAllData();
        } catch (error) {
            console.error("Error updating appointment:", error);
            alert("Failed to update appointment");
        }
    };

    const handleRegisterAdmin = async (e) => {
        e.preventDefault();
        setAdminFormMsg({ type: '', text: '' });
        try {
            const response = await axios.post('http://localhost:8085/api/auth/register', {
                emailId: adminForm.emailId,
                passwordHash: adminForm.password,
                role: adminForm.role
            });
            
            if (response.data && response.data.includes('successfully')) {
                setAdminFormMsg({ type: 'success', text: `${adminForm.role} registered! An OTP has been sent to their email for verification.` });
                setAdminForm({ emailId: '', password: '', role: 'Admin' });
                fetchAllData();
            } else {
                setAdminFormMsg({ type: 'error', text: response.data });
            }
        } catch (err) {
            if (err.response && err.response.data) {
                setAdminFormMsg({ type: 'error', text: err.response.data });
            } else {
                setAdminFormMsg({ type: 'error', text: "Registration failed. Please try again." });
            }
        }
    };

    const handleGenerateReport = async (type) => {
        try {
            const response = await axios.get(`http://localhost:8085/api/reports/${type}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                responseType: 'blob'
            });
            
            const mimeType = type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
            setReportPreview({ type, url });
            setPreviewModalOpen(true);
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Failed to generate report. Make sure the backend supports this endpoint.");
        }
    };

    const handleDownloadPreview = () => {
        if (!reportPreview) return;
        const link = document.createElement('a');
        link.href = reportPreview.url;
        link.setAttribute('download', `admin_report.${reportPreview.type}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    };

    const renderDashboard = () => {
        const roleData = [
            { name: 'Admin', count: users.filter(u => u.role === 'Admin').length },
            { name: 'Doctor', count: users.filter(u => u.role === 'Doctor').length },
            { name: 'Patient', count: users.filter(u => u.role === 'Patient').length }
        ];

        const appointmentStatuses = ['Scheduled', 'Completed', 'Cancelled'];
        const COLORS = ['#0ea5e9', '#10b981', '#f43f5e'];
        const appointmentData = appointmentStatuses.map(status => ({
            name: status,
            value: appointments.filter(a => a.appointmentStatus === status).length
        })).filter(item => item.value > 0);

        return (
        <div className="dashboard-content">
            <div className="admin-stats-grid">
                <div className="stat-card">
                    <h3>Total Users</h3>
                    <div className="stat-value">{stats.users}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Doctors</h3>
                    <div className="stat-value">{stats.doctors}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Patients</h3>
                    <div className="stat-value">{stats.patients}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Appointments</h3>
                    <div className="stat-value">{stats.appointments}</div>
                </div>
            </div>
            
            <div className="charts-container">
                <div className="chart-box">
                    <h3>Users by Role</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={roleData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#38bdf8" name="Count" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-box">
                    <h3>Appointments Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={appointmentData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                                {appointmentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
        );
    };

    const renderUsers = () => (
        <div className="admin-table-container">
            <h3>Manage Users</h3>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.userId}>
                            <td>{u.userId}</td>
                            <td>{u.emailId}</td>
                            <td><span className={`role-badge ${u.role.toLowerCase()}`}>{u.role}</span></td>
                            <td>
                                {u.active ? 
                                    <span className="status-badge active">Active</span> : 
                                    <span className="status-badge suspended">Suspended</span>
                                }
                            </td>
                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="action-buttons">
                                <button className={`btn-toggle ${u.active ? 'suspend' : 'activate'}`} onClick={() => handleToggleUserStatus(u.userId)}>
                                    {u.active ? 'Suspend' : 'Activate'}
                                </button>
                                <button className="btn-delete" onClick={() => handleDeleteUser(u.userId)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderDoctors = () => (
        <div className="admin-table-container">
            <h3>Registered Doctors</h3>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Specialization</th>
                        <th>Contact</th>
                        <th>Hospital</th>
                    </tr>
                </thead>
                <tbody>
                    {doctors.map(d => (
                        <tr key={d.doctorId}>
                            <td>{d.doctorId}</td>
                            <td>{d.doctorName}</td>
                            <td>{d.specialization}</td>
                            <td>{d.contactNumber}</td>
                            <td>{d.hospitalAffiliation}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderPatients = () => (
        <div className="admin-table-container">
            <h3>Registered Patients</h3>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Mobile Number</th>
                        <th>City</th>
                        <th>Age</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map(p => (
                        <tr key={p.patientId}>
                            <td>{p.patientId}</td>
                            <td>{p.patientName}</td>
                            <td>{p.mobileNumber}</td>
                            <td>{p.city}</td>
                            <td>{p.age}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderAppointments = () => (
        <div className="admin-table-container">
            <h3>All Appointments</h3>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Patient ID</th>
                        <th>Slot ID</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map(a => (
                        <tr key={a.appointmentId}>
                            <td>{a.appointmentId}</td>
                            <td>{a.patient?.patientId}</td>
                            <td>{a.slot?.slotId}</td>
                            <td>{a.appointmentDate}</td>
                            <td><span className={`status-badge ${a.appointmentStatus.toLowerCase()}`}>{a.appointmentStatus}</span></td>
                            <td>
                                <select 
                                    value={a.appointmentStatus}
                                    onChange={(e) => handleUpdateAppointment(a.appointmentId, e.target.value)}
                                    className="status-select"
                                >
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderReviews = () => (
        <div className="admin-table-container">
            <h3>Manage Reviews</h3>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Rating</th>
                        <th>Comment</th>
                        <th>Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map(r => (
                        <tr key={r.reviewId}>
                            <td>{r.reviewId}</td>
                            <td>{r.patient?.patientName || `ID: ${r.patient?.patientId}`}</td>
                            <td>{r.doctor?.doctorName || `ID: ${r.doctor?.doctorId}`}</td>
                            <td>
                                <span className="rating-badge">
                                    {r.rating} ⭐
                                </span>
                            </td>
                            <td>{r.comment}</td>
                            <td>{new Date(r.reviewDate).toLocaleDateString()}</td>
                            <td>
                                <button className="btn-delete" onClick={() => handleDeleteReview(r.reviewId)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderRegisterAdmin = () => (
        <div className="admin-form-container">
            <h3>Register New System User</h3>
            <p>Create an account for Admin, Doctor, or Patient.</p>
            
            {adminFormMsg.text && (
                <div className={`form-msg ${adminFormMsg.type}`}>
                    {adminFormMsg.text}
                </div>
            )}

            <form onSubmit={handleRegisterAdmin} className="admin-form">
                <div className="input-group">
                    <label>Role</label>
                    <select 
                        value={adminForm.role} 
                        onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                        className="role-select"
                    >
                        <option value="Admin">Admin</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Patient">Patient</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Email Address</label>
                    <input 
                        type="email" 
                        value={adminForm.emailId} 
                        onChange={(e) => setAdminForm({ ...adminForm, emailId: e.target.value })} 
                        required 
                        placeholder="user@system.com"
                    />
                </div>
                <div className="input-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        value={adminForm.password} 
                        onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} 
                        required 
                        placeholder="Enter secure password"
                    />
                </div>
                <button type="submit" className="btn-primary">Register User</button>
            </form>
        </div>
    );

    const renderReports = () => (
        <div className="admin-form-container">
            <h3>Generate System Reports</h3>
            <p>Download comprehensive reports for the channeling system.</p>
            
            <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                <button className="btn-primary" onClick={() => handleGenerateReport('pdf')}>Generate PDF Report</button>
                <button className="btn-primary" onClick={() => handleGenerateReport('excel')}>Generate Excel Report</button>
            </div>
        </div>
    );

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="admin-dashboard-wrapper">
            {/* Sidebar Toggle Overlay for Mobile */}
            {isSidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
            
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="admin-brand">
                    <h2>Admin <span>Panel</span></h2>
                    <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
                        ✕
                    </button>
                </div>
                <ul className="admin-nav">
                    <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                        <i className="icon-dashboard"></i> Dashboard
                    </li>
                    <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                        <i className="icon-users"></i> Manage Users
                    </li>
                    <li className={activeTab === 'doctors' ? 'active' : ''} onClick={() => setActiveTab('doctors')}>
                        <i className="icon-doctors"></i> Manage Doctors
                    </li>
                    <li className={activeTab === 'patients' ? 'active' : ''} onClick={() => setActiveTab('patients')}>
                        <i className="icon-patients"></i> Manage Patients
                    </li>
                    <li className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>
                        <i className="icon-appointments"></i> Appointments
                    </li>
                    <li className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
                        <i className="icon-reviews"></i> Manage Reviews
                    </li>
                    <li className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
                        <i className="icon-reports"></i> Reports
                    </li>
                    <li className={activeTab === 'registerAdmin' ? 'active' : ''} onClick={() => setActiveTab('registerAdmin')}>
                        <i className="icon-admin"></i> Register User
                    </li>
                </ul>
                <div className="admin-logout">
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </aside>
            <main className="admin-main-content">
                <header className="admin-header">
                    <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1').trim()}</h2>
                    <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
                        ☰
                    </button>
                </header>
                <div className="admin-content-area">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'doctors' && renderDoctors()}
                    {activeTab === 'patients' && renderPatients()}
                    {activeTab === 'appointments' && renderAppointments()}
                    {activeTab === 'reviews' && renderReviews()}
                    {activeTab === 'reports' && renderReports()}
                    {activeTab === 'registerAdmin' && renderRegisterAdmin()}
                </div>
            </main>

            {/* Report Preview Modal */}
            {previewModalOpen && reportPreview && (
                <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                    <div className="modal-content" style={{background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '16px', width: '80%', maxWidth: '900px', height: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>
                        <div className="modal-header" style={{padding: '20px 24px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <h3 style={{margin: 0, color: 'var(--admin-text-primary)'}}>Report Preview ({reportPreview.type.toUpperCase()})</h3>
                            <button className="close-btn" style={{background: 'transparent', border: 'none', color: 'var(--admin-text-secondary)', fontSize: '24px', cursor: 'pointer'}} onClick={() => setPreviewModalOpen(false)}>✕</button>
                        </div>
                        <div className="modal-body" style={{flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--admin-bg)'}}>
                            {reportPreview.type === 'pdf' ? (
                                <iframe 
                                    src={reportPreview.url} 
                                    style={{width: '100%', height: '100%', border: `1px solid var(--admin-border)`, borderRadius: '8px', background: 'white'}}
                                    title="PDF Report Preview"
                                />
                            ) : (
                                <div style={{textAlign: 'center', color: 'var(--admin-text-primary)'}}>
                                    <i style={{fontSize: '64px', color: 'var(--admin-success)', marginBottom: '16px'}}>📊</i>
                                    <h3>Excel Report Generated</h3>
                                    <p>Preview is not available for Excel files in the browser.</p>
                                    <p>Please click 'Download File' to view.</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer" style={{padding: '20px 24px', borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                            <button className="btn-secondary" style={{padding: '10px 20px', background: 'transparent', color: 'var(--admin-text-primary)', border: '1px solid var(--admin-border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600}} onClick={() => setPreviewModalOpen(false)}>Close</button>
                            <button className="btn-primary" onClick={handleDownloadPreview}>
                                Download File
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
