package com.example.doctorchannelling.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "Admins")
public class Admin {

    @Id
    @Column(name = "AdminID")
    private Integer adminId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "AdminID")
    private User user;

    @NotBlank
    @Column(name = "AdminName", nullable = false, length = 100)
    private String adminName;

    @Column(name = "ContactNumber", length = 15)
    private String contactNumber;

    public Integer getAdminId() { return adminId; }
    public void setAdminId(Integer adminId) { this.adminId = adminId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getAdminName() { return adminName; }
    public void setAdminName(String adminName) { this.adminName = adminName; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
}
