package com.example.doctorchannelling.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "Receptionists")
public class Receptionist {

    @Id
    @Column(name = "ReceptionistID")
    private Integer receptionistId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "ReceptionistID")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @NotBlank
    @Column(name = "ReceptionistName", nullable = false, length = 100)
    private String receptionistName;

    @Pattern(regexp = "^[0-9]*$")
    @Column(name = "ContactNumber", length = 15)
    private String contactNumber;

    @Column(name = "IsActive", nullable = false)
    private boolean isActive = true;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    @SuppressWarnings("unused")
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Integer getReceptionistId() { return receptionistId; }
    public void setReceptionistId(Integer receptionistId) { this.receptionistId = receptionistId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getReceptionistName() { return receptionistName; }
    public void setReceptionistName(String receptionistName) { this.receptionistName = receptionistName; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
