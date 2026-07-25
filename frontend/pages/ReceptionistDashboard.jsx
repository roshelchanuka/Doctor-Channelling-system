import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatWindow from '../src/components/ChatWindow';
import AppointmentsView from '../src/components/receptionist/AppointmentsView';
import PatientsView from '../src/components/receptionist/PatientsView';
import DoctorsView from '../src/components/receptionist/DoctorsView';
import PaymentsView from '../src/components/receptionist/PaymentsView';
import RegisterPatientView from '../src/components/receptionist/RegisterPatientView';
import './ReceptionistDashboard.css';

const ReportView = ({ title, category, token }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchPreview = async () => {
        setLoading(true);
        try {
            let urlParam = `http://localhost:8085/api/reports/${category}/pdf`;
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            
            const queryString = params.toString();
            if (queryString) urlParam += `?${queryString}`;

            const response = await axios.get(urlParam, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setPreviewUrl(url);
        } catch (error) {
            console.error("Error fetching preview:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPreview();
        return () => {
            if (previewUrl) window.URL.revokeObjectURL(previewUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, token]); // Fetch initially on category/token change

    const handleDownload = async (format) => {
        try {
            let urlParam = `http://localhost:8085/api/reports/${category}/${format}`;
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            
            const queryString = params.toString();
            if (queryString) urlParam += `?${queryString}`;

            const response = await axios.get(urlParam, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const mimeType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${category}_report.${format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading report:", error);
            alert("Failed to download report.");
        }
    };

    return (
        <div className="receptionist-form-container" style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--receptionist-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--receptionist-border)', boxSizing: 'border-box' }}>
            <div>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--receptionist-text-primary)' }}>{title}</h3>
                <p style={{ margin: 0, color: 'var(--receptionist-text-secondary)' }}>Preview and download the {title.toLowerCase()} for the channeling system.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid var(--receptionist-border)', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '1 1 200px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Start Date:</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '1 1 200px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 'bold' }}>End Date:</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }} />
                </div>
                <button className="btn-primary" style={{ padding: '8px 16px', height: '37px', flex: '1 1 150px', whiteSpace: 'nowrap' }} onClick={fetchPreview}>Filter Report</button>
            </div>

            <div className="report-preview-box" style={{ width: '100%', height: '500px', border: '1px solid var(--receptionist-border)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--receptionist-text-secondary)' }}>Loading preview...</div>
                ) : previewUrl ? (
                    <iframe src={previewUrl} width="100%" height="100%" title="Report Preview" style={{ border: 'none' }} />
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--receptionist-error)' }}>Failed to load preview</div>
                )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px', width: 'auto' }} onClick={() => handleDownload('pdf')}>Export to PDF</button>
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px', width: 'auto' }} onClick={() => handleDownload('excel')}>Export to Excel</button>
            </div>
        </div>
    );
};

const ReceptionistDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ activeChats: 0, appointmentsToday: 0 });
    const [conversations, setConversations] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isReportsOpen, setIsReportsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedConversation, setSelectedConversation] = useState(null);
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    useEffect(() => {
        const role = localStorage.getItem('role');
        if (!token || !role || role.toUpperCase() !== 'RECEPTIONIST') {
            navigate('/login');
            return;
        }
        fetchConversations();
    }, [navigate, token]);

    const fetchConversations = async () => {
        try {
            const response = await axios.get(`http://localhost:8085/api/chat/conversations/receptionist/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(response.data);
            setStats(prev => ({ ...prev, activeChats: response.data.length }));
        } catch (error) {
            console.error("Error fetching conversations:", error);
            setConversations([
                { conversationId: 1, patientId: 101, status: 'OPEN', patientName: 'Kamal Perera', lastMessageAt: new Date().toISOString() },
                { conversationId: 2, patientId: 102, status: 'OPEN', patientName: 'Nimali Silva', lastMessageAt: new Date().toISOString() }
            ]);
        }
    };

    const handleCloseConversation = async (conversationId, e) => {
        e.stopPropagation();
        try {
            await axios.put(`http://localhost:8085/api/chat/conversations/${conversationId}/close`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchConversations();
            if (selectedConversation && selectedConversation.conversationId === conversationId) {
                setSelectedConversation(null);
            }
        } catch (error) {
            console.error("Error closing conversation:", error);
            setConversations(prev => prev.filter(c => c.conversationId !== conversationId));
            if (selectedConversation && selectedConversation.conversationId === conversationId) {
                setSelectedConversation(null);
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="receptionist-dashboard-wrapper">
            {isSidebarOpen && <div className="receptionist-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
            
            <aside className={`receptionist-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="receptionist-brand">
                    <h2>Doc<span>Channel</span></h2>
                    <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>✕</button>
                </div>
                <p style={{ margin: '0 20px 20px', fontSize: '0.85rem', color: 'var(--receptionist-text-secondary)' }}>Reception Desk</p>
                <ul className="receptionist-nav">
                    <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Live Chat</li>
                    <li className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>Appointments</li>
                    <li className={activeTab === 'patients' ? 'active' : ''} onClick={() => setActiveTab('patients')}>Patients</li>
                    <li className={activeTab === 'register-patient' ? 'active' : ''} onClick={() => setActiveTab('register-patient')}>Register Patient</li>
                    <li className={activeTab === 'doctors' ? 'active' : ''} onClick={() => setActiveTab('doctors')}>Doctors</li>
                    <li className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>Payments</li>
                    <li className={activeTab.startsWith('report') ? 'active' : ''} onClick={() => setIsReportsOpen(!isReportsOpen)}>
                        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
                            <span>Reports</span>
                            <span style={{fontSize: '12px'}}>{isReportsOpen ? '▼' : '▶'}</span>
                        </div>
                    </li>
                    {isReportsOpen && (
                        <ul className="receptionist-submenu">
                            <li className={activeTab === 'report-patient' ? 'active' : ''} onClick={() => setActiveTab('report-patient')}>Patient Demographics</li>
                            <li className={activeTab === 'report-doctor' ? 'active' : ''} onClick={() => setActiveTab('report-doctor')}>Doctor Performance</li>
                        </ul>
                    )}
                </ul>
                <div className="receptionist-logout">
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </aside>

            <main className="receptionist-main-content">
                <header className="receptionist-header">
                    <div>
                        <h2>Welcome, Receptionist</h2>
                        <p>Manage your daily clinic operations seamlessly.</p>
                    </div>
                    <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
                </header>

                <div className="receptionist-content-area">
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="conversations-container">
                                <h3>Active Inquiries</h3>
                                <div className="conversations-list">
                                    {conversations.length === 0 ? (
                                        <p style={{color: 'var(--receptionist-text-secondary)', padding: '12px'}}>No active chats.</p>
                                    ) : (
                                        conversations.map(conv => (
                                            <div 
                                                key={conv.conversationId} 
                                                className={`conversation-card ${selectedConversation?.conversationId === conv.conversationId ? 'active' : ''}`}
                                                onClick={() => setSelectedConversation(conv)}
                                            >
                                                <div className="avatar">{conv.patientName ? conv.patientName.charAt(0) : 'P'}</div>
                                                <div className="conv-details" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                    <div>
                                                        <h4>{conv.patientName || `Patient #${conv.patientId}`}</h4>
                                                        <span className="badge-open">Open</span>
                                                        <button 
                                                            onClick={(e) => handleCloseConversation(conv.conversationId, e)}
                                                            style={{ marginLeft: '10px', background: 'var(--receptionist-error, #ff4d4f)', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer' }}
                                                        >
                                                            Close
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="chat-container">
                                {selectedConversation ? (
                                    <ChatWindow conversation={selectedConversation} receptionistId={userId} token={token} />
                                ) : (
                                    <div className="empty-chat-state">
                                        <div className="illustration">💬</div>
                                        <h3>Select a conversation to start chatting</h3>
                                        <p>Respond to patient inquiries in real-time.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'appointments' && <AppointmentsView token={token} />}
                    {activeTab === 'patients' && <PatientsView token={token} />}
                    {activeTab === 'register-patient' && <RegisterPatientView token={token} onSuccess={() => setActiveTab('patients')} />}
                    {activeTab === 'doctors' && <DoctorsView token={token} />}
                    {activeTab === 'payments' && <PaymentsView token={token} receptionistId={userId} />}

                    {activeTab === 'report-patient' && <ReportView title="Patient Demographics Report" category="patient" token={token} />}
                    {activeTab === 'report-doctor' && <ReportView title="Doctor Performance Report" category="doctor" token={token} />}
                </div>
            </main>
        </div>
    );
};

export default ReceptionistDashboard;
