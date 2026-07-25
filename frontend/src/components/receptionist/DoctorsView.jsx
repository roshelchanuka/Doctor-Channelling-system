import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DoctorsView = ({ token }) => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchDoctors() {
        try {
            const response = await axios.get('http://localhost:8085/api/doctors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctors(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) return <div>Loading doctors...</div>;

    return (
        <div className="receptionist-form-container" style={{background: 'var(--receptionist-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--receptionist-border)'}}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--receptionist-text-primary)' }}>Doctor Schedules</h3>
            
            <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                    <thead>
                        <tr style={{borderBottom: '1px solid var(--receptionist-border)'}}>
                            <th style={{padding: '12px'}}>Name</th>
                            <th style={{padding: '12px'}}>Specialization</th>
                            <th style={{padding: '12px'}}>Hospital</th>
                            <th style={{padding: '12px'}}>Fee (LKR)</th>
                            <th style={{padding: '12px'}}>Available Slots</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.length === 0 ? (
                            <tr><td colSpan="5" style={{padding: '12px', textAlign: 'center'}}>No doctors found.</td></tr>
                        ) : doctors.map(doc => (
                            <tr key={doc.doctorId} style={{borderBottom: '1px solid var(--receptionist-border)'}}>
                                <td style={{padding: '12px'}}>{doc.doctorName}</td>
                                <td style={{padding: '12px'}}>{doc.specialization}</td>
                                <td style={{padding: '12px'}}>{doc.hospital}</td>
                                <td style={{padding: '12px'}}>{doc.consultationFee}</td>
                                <td style={{padding: '12px'}}>
                                    {doc.slots && doc.slots.length > 0 ? (
                                        <ul style={{margin: 0, paddingLeft: '20px'}}>
                                            {doc.slots.map(slot => (
                                                <li key={slot.slotId}>
                                                    {slot.slotDate} ({slot.startTime} - {slot.endTime}) - {slot.maxPatients} max
                                                </li>
                                            ))}
                                        </ul>
                                    ) : 'No slots available'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DoctorsView;
