import React, { useState, useEffect, useRef } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import '../ChatWindow.css';

const PatientChatView = ({ patientId, token }) => {
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        let currentClient = null;

        const fetchConversationAndMessages = async () => {
            try {
                // 1. Get or Create conversation for this patient
                const convRes = await axios.get(`http://localhost:8085/api/chat/conversations/patient/${patientId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const currentConv = convRes.data;
                setConversation(currentConv);

                // 2. Fetch past messages
                const msgRes = await axios.get(`http://localhost:8085/api/chat/conversations/${currentConv.conversationId}/messages`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(msgRes.data);
                
                // 3. Connect WebSocket
                const socket = new SockJS('http://localhost:8085/ws');
                currentClient = Stomp.over(socket);
                currentClient.debug = () => {}; 
                
                currentClient.connect({}, () => {
                    currentClient.subscribe(`/topic/chat/${currentConv.conversationId}`, (message) => {
                        const receivedMsg = JSON.parse(message.body);
                        setMessages(prev => [...prev, receivedMsg]);
                    });
                });

                setStompClient(currentClient);
            } catch (err) {
                console.error("Error setting up chat:", err);
                setError("Failed to connect to chat server.");
            } finally {
                setLoading(false);
            }
        };

        if (patientId && token) {
            fetchConversationAndMessages();
        }

        return () => {
            if (currentClient) {
                currentClient.disconnect();
            }
        };
    }, [patientId, token]);

    const sendMessage = () => {
        if (!messageInput.trim() || !stompClient || !conversation) return;

        const chatMessage = {
            conversationId: conversation.conversationId,
            senderId: patientId, // Patient is sending
            messageContent: messageInput
        };

        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        setMessageInput("");
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Connecting to support...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>{error}</div>;
    }

    return (
        <div className="page-section animate-fade-in" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: '16px' }}>
                <h2>Live Chat Support</h2>
                <p>Chat with our receptionists for any assistance</p>
            </div>

            <div className="chat-window-container" style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <header className="chat-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <div className="chat-avatar" style={{ background: '#4338ca', color: '#fff' }}>R</div>
                    <div className="chat-info">
                        <h3 style={{ color: '#1e293b' }}>Reception Desk</h3>
                        <span style={{ color: '#10b981' }}>● Online</span>
                    </div>
                </header>

                <div className="messages-container" style={{ background: '#fff' }}>
                    {messages.length === 0 ? (
                        <div className="no-messages">No messages yet. Send a message to start!</div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMine = String(msg.senderId) === String(patientId);
                            return (
                                <div key={idx} className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                    <div className="bubble-content">{msg.messageContent}</div>
                                    <div className="bubble-time">
                                        {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <textarea 
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        rows={1}
                        style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '24px', padding: '12px 16px' }}
                    />
                    <button className="send-btn" onClick={sendMessage} style={{ background: '#4338ca' }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientChatView;
