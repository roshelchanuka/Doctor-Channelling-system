package com.example.doctorchannelling.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "ChatMessages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MessageID")
    private Integer messageId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ConversationID", nullable = false)
    private ChatConversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "SenderID", nullable = false)
    private User sender;

    @NotBlank
    @Column(name = "MessageType", nullable = false, length = 10)
    private String messageType = "TEXT";

    @NotBlank
    @Column(name = "MessageText", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String messageText;

    @Column(name = "AttachmentUrl", length = 500)
    private String attachmentUrl;

    @Column(name = "SentAt", nullable = false, updatable = false)
    private LocalDateTime sentAt;

    @Column(name = "IsRead", nullable = false)
    private boolean isRead = false;

    @Column(name = "ReadAt")
    private LocalDateTime readAt;

    @Column(name = "IsDeleted", nullable = false)
    private boolean isDeleted = false;

    @PrePersist
    @SuppressWarnings("unused")
    void prePersist() {
        if (sentAt == null) {
            sentAt = LocalDateTime.now().truncatedTo(java.time.temporal.ChronoUnit.SECONDS);
        }
    }

    // Getters and Setters
    public Integer getMessageId() { return messageId; }
    public void setMessageId(Integer messageId) { this.messageId = messageId; }

    public ChatConversation getConversation() { return conversation; }
    public void setConversation(ChatConversation conversation) { this.conversation = conversation; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { this.isDeleted = deleted; }
}
