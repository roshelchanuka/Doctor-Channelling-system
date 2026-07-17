import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PatientsView = ({ token }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await axios.get('http://localhost:8085/api/patients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching patients:", error);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading patients...</div>;

    return (
        <div className="receptionist-form-container" style={{background: 'var(--receptionist-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--receptionist-border)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <h3 style={{ margin: 0, color: 'var(--receptionist-text-primary)' }}>Patients Management</h3>
            </div>
            
            <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                    <thead>
                        <tr style={{borderBottom: '1px solid var(--receptionist-border)'}}>
                            <th style={{padding: '12px'}}>Patient ID</th>
                            <th style={{padding: '12px'}}>Name</th>
                            <th style={{padding: '12px'}}>Email</th>
                            <th style={{padding: '12px'}}>Gender</th>
                            <th style={{padding: '12px'}}>DOB</th>
                            <th style={{padding: '12px'}}>Emergency Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.length === 0 ? (
                            <tr><td colSpan="6" style={{padding: '12px', textAlign: 'center'}}>No patients found.</td></tr>
                        ) : patients.map(p => (
                            <tr key={p.patientId} style={{borderBottom: '1px solid var(--receptionist-border)'}}>
                                <td style={{padding: '12px'}}>#{p.patientId}</td>
                                <td style={{padding: '12px'}}>{p.user?.fullName || 'N/A'}</td>
                                <td style={{padding: '12px'}}>{p.user?.email || 'N/A'}</td>
                                <td style={{padding: '12px'}}>{p.gender || 'N/A'}</td>
                                <td style={{padding: '12px'}}>{p.dateOfBirth || 'N/A'}</td>
                                <td style={{padding: '12px'}}>{p.emergencyContactPhone || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientsView;
