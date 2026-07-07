import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ users: 0, doctors: 0, patients: 0, appointments: 0 });
    const [users, setUsers] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    
    // Register Admin Form
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
            const [usersRes, doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
                axios.get('http://localhost:8085/api/users', getHeaders()),
                axios.get('http://localhost:8085/api/doctors', getHeaders()),
                axios.get('http://localhost:8085/api/patients', getHeaders()),
                axios.get('http://localhost:8085/api/appointments', getHeaders())
            ]);

            setUsers(usersRes.data || []);
            setDoctors(doctorsRes.data || []);
            setPatients(patientsRes.data || []);
            setAppointments(appointmentsRes.data || []);

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
                role: 'Admin'
            });
            
            if (response.data && response.data.includes('successfully')) {
                setAdminFormMsg({ type: 'success', text: "Admin registered! An OTP has been sent to their email for verification." });
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

    const renderDashboard = () => (
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
    );

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
                            <td>{u.verified ? 'Verified' : 'Pending'}</td>
                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td>
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

    const renderRegisterAdmin = () => (
        <div className="admin-form-container">
            <h3>Register New Administrator</h3>
            <p>Create an account with Admin privileges.</p>
            
            {adminFormMsg.text && (
                <div className={`form-msg ${adminFormMsg.type}`}>
                    {adminFormMsg.text}
                </div>
            )}

            <form onSubmit={handleRegisterAdmin} className="admin-form">
                <div className="input-group">
                    <label>Email Address</label>
                    <input 
                        type="email" 
                        value={adminForm.emailId} 
                        onChange={(e) => setAdminForm({ ...adminForm, emailId: e.target.value })} 
                        required 
                        placeholder="admin@system.com"
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
                <button type="submit" className="btn-primary">Register Admin</button>
            </form>
        </div>
    );

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="admin-dashboard-wrapper">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <h2>Admin <span>Panel</span></h2>
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
                    <li className={activeTab === 'registerAdmin' ? 'active' : ''} onClick={() => setActiveTab('registerAdmin')}>
                        <i className="icon-admin"></i> Register Admin
                    </li>
                </ul>
                <div className="admin-logout">
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </aside>
            <main className="admin-main-content">
                <header className="admin-header">
                    <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1').trim()}</h2>
                </header>
                <div className="admin-content-area">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'doctors' && renderDoctors()}
                    {activeTab === 'patients' && renderPatients()}
                    {activeTab === 'appointments' && renderAppointments()}
                    {activeTab === 'registerAdmin' && renderRegisterAdmin()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
