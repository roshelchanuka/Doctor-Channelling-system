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
    @Column(name = "SenderName", nullable = false, length = 200)
    private String senderName;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ReplyByID")
    private User replyBy;

    @Column(name = "ReplyByName", length = 200)
    private String replyByName;

    @Column(name = "ReplyText", columnDefinition = "NVARCHAR(MAX)")
    private String replyText;

    @Column(name = "ReplyAt")
    private LocalDateTime replyAt;

    @PrePersist
    @SuppressWarnings("unused")
    void prePersist() {
        if (sentAt == null) {
            sentAt = LocalDateTime.now().truncatedTo(java.time.temporal.ChronoUnit.SECONDS);
        }
        if (senderName == null && sender != null) {
            senderName = sender.getEmailId() != null ? sender.getEmailId() : "User";
        }
    }

    // Getters and Setters
    public Integer getMessageId() { return messageId; }
    public void setMessageId(Integer messageId) { this.messageId = messageId; }

    public ChatConversation getConversation() { return conversation; }
    public void setConversation(ChatConversation conversation) { this.conversation = conversation; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

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
    public void setDeleted(boolean deleted) { isDeleted = deleted; }

    public User getReplyBy() { return replyBy; }
    public void setReplyBy(User replyBy) { this.replyBy = replyBy; }

    public String getReplyByName() { return replyByName; }
    public void setReplyByName(String replyByName) { this.replyByName = replyByName; }

    public String getReplyText() { return replyText; }
    public void setReplyText(String replyText) { this.replyText = replyText; }

    public LocalDateTime getReplyAt() { return replyAt; }
    public void setReplyAt(LocalDateTime replyAt) { this.replyAt = replyAt; }
}
