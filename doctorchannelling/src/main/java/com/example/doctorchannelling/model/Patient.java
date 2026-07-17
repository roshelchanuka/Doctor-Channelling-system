package com.example.doctorchannelling.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "Patients")
public class Patient {

    @Id
    @Column(name = "PatientID")
    private Integer patientId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "PatientID")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @NotBlank
    @Column(name = "PatientName", nullable = false, length = 100)
    private String patientName;

    @NotBlank
    @Column(name = "MobileNumber", nullable = false, length = 15)
    private String mobileNumber;

    @Column(name = "City", length = 50)
    private String city;

    @Column(name = "Age")
    private Integer age;

    @Lob
    @Column(name = "MedicalHistory", columnDefinition = "NVARCHAR(MAX)")
    private String medicalHistory;

    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getMedicalHistory() { return medicalHistory; }
    public void setMedicalHistory(String medicalHistory) { this.medicalHistory = medicalHistory; }
}
