import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatWindow from '../src/components/ChatWindow';
import './ReceptionistDashboard.css';

const ReceptionistDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ activeChats: 0, appointmentsToday: 0 });
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    // Report Preview State
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [reportPreview, setReportPreview] = useState(null); // { type: 'pdf' | 'excel', url: string }

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
            const response = await axios.get(`http://localhost:8085/api/chat/conversations/${userId}`, {
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

    const handleGenerateReport = async (type) => {
        try {
            const response = await axios.get(`http://localhost:8085/api/reports/${type}`, {
                headers: { Authorization: `Bearer ${token}` },
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
        link.setAttribute('download', `receptionist_report.${reportPreview.type}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="receptionist-dashboard-wrapper">
            {/* Sidebar */}
            <aside className="receptionist-sidebar">
                <div className="receptionist-brand">
                    <h2>Doc<span>Channel</span></h2>
                    <p>Reception Desk</p>
                </div>
                <ul className="receptionist-nav">
                    <li className="active">Dashboard</li>
                    <button onClick={() => handleGenerateReport('pdf')}>Generate PDF Report</button>
                    <button onClick={() => handleGenerateReport('excel')}>Generate Excel Report</button>
                </ul>
                <div className="receptionist-logout">
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="receptionist-main-content">
                <header className="receptionist-header">
                    <h2>Welcome, Receptionist</h2>
                    <p>Manage your chats and generate reports easily.</p>
                </header>

                <div className="receptionist-content-area">
                    {/* Conversations List */}
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
                                        <div className="conv-details">
                                            <h4>{conv.patientName || `Patient #${conv.patientId}`}</h4>
                                            <span className="badge-open">Open</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="chat-container">
                        {selectedConversation ? (
                            <ChatWindow 
                                conversation={selectedConversation} 
                                receptionistId={userId} 
                                token={token} 
                            />
                        ) : (
                            <div className="empty-chat-state">
                                <div className="illustration">💬</div>
                                <h3>Select a conversation to start chatting</h3>
                                <p>Respond to patient inquiries in real-time.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Report Preview Modal */}
            {previewModalOpen && reportPreview && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Report Preview ({reportPreview.type.toUpperCase()})</h3>
                            <button className="close-btn" onClick={() => setPreviewModalOpen(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {reportPreview.type === 'pdf' ? (
                                <iframe 
                                    src={reportPreview.url} 
                                    className="report-iframe" 
                                    title="PDF Report Preview"
                                />
                            ) : (
                                <div className="excel-placeholder">
                                    <i>📊</i>
                                    <h3>Excel Report Generated</h3>
                                    <p>Preview is not available for Excel files in the browser.</p>
                                    <p>Please click 'Download File' to view.</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setPreviewModalOpen(false)}>Close</button>
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

export default ReceptionistDashboard;
