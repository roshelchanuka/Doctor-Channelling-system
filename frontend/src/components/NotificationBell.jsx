import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationBell = ({ userId, token }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (userId && token) {
            fetchNotifications();
            // Optional: Set up polling
            const interval = setInterval(fetchNotifications, 30000); // Check every 30s
            return () => clearInterval(interval);
        }
    }, [userId, token]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`http://localhost:8085/api/notifications/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:8085/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div style={{ position: 'relative' }}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', position: 'relative' }}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-5px', right: '-5px',
                        background: 'red', color: 'white', borderRadius: '50%',
                        padding: '2px 6px', fontSize: '0.75rem', fontWeight: 'bold'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: '40px', right: '0',
                    width: '350px', background: 'white', border: '1px solid #e2e8f0',
                    borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    zIndex: 1000, maxHeight: '400px', overflowY: 'auto'
                }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#2d3748' }}>
                        Notifications
                    </div>
                    {notifications.length === 0 ? (
                        <div style={{ padding: '1rem', color: '#a0aec0', textAlign: 'center' }}>No notifications</div>
                    ) : (
                        notifications.map(n => (
                            <div 
                                key={n.id} 
                                style={{ 
                                    padding: '1rem', 
                                    borderBottom: '1px solid #edf2f7',
                                    background: n.isRead ? 'white' : '#ebf8ff',
                                    cursor: 'pointer'
                                }}
                                onClick={() => !n.isRead && markAsRead(n.id)}
                            >
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#4a5568' }}>{n.message}</p>
                                <small style={{ color: '#a0aec0', fontSize: '0.75rem' }}>
                                    {new Date(n.createdAt).toLocaleString()}
                                </small>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
