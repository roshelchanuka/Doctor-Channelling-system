package com.example.doctorchannelling.model;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "Doctors")
public class Doctor {

    @Id
    @Column(name = "DoctorID")
    private Integer doctorId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "DoctorID")
    @JsonIgnore
    private User user;

    @NotBlank
    @Column(name = "DoctorName", nullable = false, length = 100)
    private String doctorName;

    @NotBlank
    @Column(name = "Specialization", nullable = false, length = 100)
    private String specialization;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "ConsultationFee", nullable = false, precision = 10, scale = 2)
    private BigDecimal consultationFee;

    @Column(name = "City", length = 100)
    private String city;

    @Column(name = "Hospital", length = 150)
    private String hospital;

    @Column(name = "ExperienceYears")
    private Integer experienceYears;

    @Column(name = "AverageRating", precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(name = "TotalReviews")
    private Integer totalReviews = 0;

    @Valid
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference
    private List<DoctorSlot> slots;

    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public BigDecimal getConsultationFee() { return consultationFee; }
    public void setConsultationFee(BigDecimal consultationFee) { this.consultationFee = consultationFee; }

    public List<DoctorSlot> getSlots() { return slots; }
    public void setSlots(List<DoctorSlot> slots) { this.slots = slots; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getHospital() { return hospital; }
    public void setHospital(String hospital) { this.hospital = hospital; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public BigDecimal getAverageRating() { return averageRating; }
    public void setAverageRating(BigDecimal averageRating) { this.averageRating = averageRating; }

    public Integer getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Integer totalReviews) { this.totalReviews = totalReviews; }
}
