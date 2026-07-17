package com.example.doctorchannelling.dto;

import java.time.LocalDateTime;

public class ChatConversationDTO {
    private Integer conversationId;
    private Integer patientId;
    private String patientName;
    private Integer receptionistId;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime closedAt;
    private LocalDateTime lastMessageAt;

    public ChatConversationDTO() {}

    public Integer getConversationId() { return conversationId; }
    public void setConversationId(Integer conversationId) { this.conversationId = conversationId; }

    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public Integer getReceptionistId() { return receptionistId; }
    public void setReceptionistId(Integer receptionistId) { this.receptionistId = receptionistId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }

    public LocalDateTime getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }
}
