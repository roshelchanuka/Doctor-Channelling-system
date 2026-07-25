import { useState, useEffect } from 'react';
import axios from 'axios';

const PatientsView = ({ token }) => {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');

    async function fetchPatients(date) {
        setLoading(true);
        try {
            const url = date ? `http://localhost:8085/api/patients?date=${date}` : 'http://localhost:8085/api/patients';
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(response.data);
            setFilteredPatients(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching patients:", error);
            setLoading(false);
        }
    }

    // Fetch patients only on mount (with today's date)
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPatients(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filter frontend list by text search
    useEffect(() => {
        if (!searchQuery) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFilteredPatients(patients);
            return;
        }
        const lowerQ = searchQuery.toLowerCase();
        const filtered = patients.filter(p => 
            (p.patientName && p.patientName.toLowerCase().includes(lowerQ)) ||
            (p.patientId && p.patientId.toString().includes(lowerQ)) ||
            (p.user?.emailId && p.user.emailId.toLowerCase().includes(lowerQ)) ||
            (p.mobileNumber && p.mobileNumber.includes(lowerQ))
        );
         
        setFilteredPatients(filtered);
    }, [searchQuery, patients]);

    if (loading) return <div>Loading patients...</div>;

    return (
        <div className="receptionist-form-container" style={{background: 'var(--receptionist-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--receptionist-border)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px'}}>
                <h3 style={{ margin: 0, color: 'var(--receptionist-text-primary)' }}>Patients Management</h3>
                <div style={{display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap'}}>
                    {/* Text Search Input (Filters the already fetched date) */}
                    <input 
                        type="text"
                        placeholder="Search by name, ID or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--receptionist-border)',
                            background: 'var(--receptionist-bg)',
                            color: 'var(--receptionist-text-primary)',
                            minWidth: '250px'
                        }}
                    />
                    
                    {/* Date Search Section */}
                    <div style={{display: 'flex', gap: '5px', alignItems: 'center', borderLeft: '1px solid var(--receptionist-border)', paddingLeft: '15px'}}>
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--receptionist-border)',
                                background: 'var(--receptionist-bg)',
                                color: 'var(--receptionist-text-primary)'
                            }}
                        />
                        <button 
                            className="btn-primary"
                            style={{ padding: '8px 16px', height: '37px', whiteSpace: 'nowrap' }}
                            onClick={() => fetchPatients(selectedDate)}
                        >
                            Search by Date
                        </button>
                    </div>
                </div>
            </div>
            
            <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                    <thead>
                        <tr style={{borderBottom: '1px solid var(--receptionist-border)'}}>
                            <th style={{padding: '12px'}}>Patient ID</th>
                            <th style={{padding: '12px'}}>Name</th>
                            <th style={{padding: '12px'}}>Email</th>
                            <th style={{padding: '12px'}}>Mobile Number</th>
                            <th style={{padding: '12px'}}>Age</th>
                            <th style={{padding: '12px'}}>City</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients.length === 0 ? (
                            <tr><td colSpan="6" style={{padding: '12px', textAlign: 'center'}}>No patients found.</td></tr>
                        ) : filteredPatients.map(p => (
                            <tr key={p.patientId} style={{borderBottom: '1px solid var(--receptionist-border)'}}>
                                <td style={{padding: '12px'}}>#{p.patientId}</td>
                                <td style={{padding: '12px'}}>{p.patientName || 'N/A'}</td>
                                <td style={{padding: '12px'}}>{p.user?.emailId || 'N/A'}</td>
                                <td style={{padding: '12px'}}>{p.mobileNumber || 'N/A'}</td>
                                <td style={{padding: '12px'}}>{p.age || 'N/A'}</td>
                                <td style={{padding: '12px'}}>{p.city || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientsView;
