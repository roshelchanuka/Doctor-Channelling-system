import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AppointmentsView = ({ token }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('http://localhost:8085/api/appointments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            setLoading(false);
        }
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            await axios.put(`http://localhost:8085/api/appointments/${appointmentId}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchAppointments(); // refresh
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status.");
        }
    };

    if (loading) return <div>Loading appointments...</div>;

    return (
        <div className="receptionist-form-container" style={{background: 'var(--receptionist-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--receptionist-border)'}}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--receptionist-text-primary)' }}>Appointments Management</h3>
            
            <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                    <thead>
                        <tr style={{borderBottom: '1px solid var(--receptionist-border)'}}>
                            <th style={{padding: '12px'}}>ID</th>
                            <th style={{padding: '12px'}}>Patient</th>
                            <th style={{padding: '12px'}}>Doctor</th>
                            <th style={{padding: '12px'}}>Date & Time</th>
                            <th style={{padding: '12px'}}>Queue No</th>
                            <th style={{padding: '12px'}}>Status</th>
                            <th style={{padding: '12px'}}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.length === 0 ? (
                            <tr><td colSpan="7" style={{padding: '12px', textAlign: 'center'}}>No appointments found.</td></tr>
                        ) : appointments.map(app => (
                            <tr key={app.appointmentId} style={{borderBottom: '1px solid var(--receptionist-border)'}}>
                                <td style={{padding: '12px'}}>#{app.appointmentId}</td>
                                <td style={{padding: '12px'}}>{app.patient?.user?.fullName || 'Unknown'}</td>
                                <td style={{padding: '12px'}}>{app.slot?.doctor?.doctorName || 'Unknown'}</td>
                                <td style={{padding: '12px'}}>{app.appointmentDate} {app.bookingTime}</td>
                                <td style={{padding: '12px'}}>{app.queueNumber}</td>
                                <td style={{padding: '12px'}}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                        backgroundColor: app.appointmentStatus === 'Scheduled' ? '#e0f2fe' : 
                                                         app.appointmentStatus === 'Completed' ? '#dcfce7' : '#fee2e2',
                                        color: app.appointmentStatus === 'Scheduled' ? '#0369a1' : 
                                               app.appointmentStatus === 'Completed' ? '#15803d' : '#b91c1c'
                                    }}>
                                        {app.appointmentStatus}
                                    </span>
                                </td>
                                <td style={{padding: '12px'}}>
                                    <select 
                                        value={app.appointmentStatus} 
                                        onChange={(e) => handleStatusChange(app.appointmentId, e.target.value)}
                                        style={{padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc'}}
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
        </div>
    );
};

export default AppointmentsView;
