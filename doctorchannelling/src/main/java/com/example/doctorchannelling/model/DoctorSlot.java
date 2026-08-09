package com.example.doctorchannelling.model;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "DoctorSlots")
public class DoctorSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SlotID")
    private Integer slotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DoctorID", nullable = false)
    @JsonBackReference
    private Doctor doctor;

    @NotNull
    @Column(name = "AvailableDate", nullable = false)
    private LocalDate availableDate;

    @NotNull
    @JsonFormat(pattern = "HH:mm:ss")
    @Column(name = "StartTime", nullable = false)
    private LocalTime startTime;

    @NotNull
    @JsonFormat(pattern = "HH:mm:ss")
    @Column(name = "EndTime", nullable = false)
    private LocalTime endTime;

    @Min(1)
    @Column(name = "MaxPatients", nullable = false)
    private Integer maxPatients = 10;

    @Min(0)
    @Column(name = "CurrentBooked", nullable = false)
    private Integer currentBooked = 0;

    @Column(name = "IsExpired")
    private Boolean isExpired = false;

    public Integer getSlotId() { return slotId; }
    public void setSlotId(Integer slotId) { this.slotId = slotId; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public LocalDate getAvailableDate() { return availableDate; }
    public void setAvailableDate(LocalDate availableDate) { this.availableDate = availableDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Integer getMaxPatients() { return maxPatients; }
    public void setMaxPatients(Integer maxPatients) { this.maxPatients = maxPatients; }

    public Integer getCurrentBooked() { return currentBooked; }
    public void setCurrentBooked(Integer currentBooked) { this.currentBooked = currentBooked; }

    public Boolean isExpired() { return isExpired; }
    public void setExpired(Boolean isExpired) { this.isExpired = isExpired; }
}
