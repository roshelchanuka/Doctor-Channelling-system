import React, { useState, useEffect, useRef } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import './ChatWindow.css';

const ChatWindow = ({ conversation, receptionistId, token }) => {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const messagesEndRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        // Fetch old messages when conversation changes
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`http://localhost:8085/api/chat/conversations/${conversation.conversationId}/messages`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(res.data);
            } catch (err) {
                console.error("Error fetching messages", err);
            }
        };

        if (conversation && conversation.conversationId) {
            fetchMessages();
            connectWebSocket();
        }

        // Cleanup on unmount or conversation change
        return () => {
            if (stompClient) {
                stompClient.disconnect();
            }
        };
    }, [conversation]);

    const connectWebSocket = () => {
        const socket = new SockJS('http://localhost:8085/ws');
        const client = Stomp.over(socket);
        client.debug = () => {}; // Disable debug logs
        
        client.connect({}, () => {
            // Subscribe to this specific conversation
            client.subscribe(`/topic/chat/${conversation.conversationId}`, (message) => {
                const receivedMsg = JSON.parse(message.body);
                setMessages(prev => [...prev, receivedMsg]);
            });
        });

        setStompClient(client);
    };

    const sendMessage = () => {
        if (!messageInput.trim() || !stompClient) return;

        const chatMessage = {
            conversationId: conversation.conversationId,
            senderId: receptionistId,
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

    return (
        <div className="chat-window-container">
            <header className="chat-header">
                <div className="chat-avatar">{conversation.patientName ? conversation.patientName.charAt(0) : 'P'}</div>
                <div className="chat-info">
                    <h3>{conversation.patientName || `Patient #${conversation.patientId}`}</h3>
                    <span>Status: {conversation.status}</span>
                </div>
            </header>

            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="no-messages">No messages yet. Send a message to start the conversation!</div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMine = String(msg.senderId) === String(receptionistId);
                        return (
                            <div key={idx} className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                <div className="bubble-content">{msg.messageContent}</div>
                                <div className="bubble-time">
                                    {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <textarea 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                />
                <button className="send-btn" onClick={sendMessage}>
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
