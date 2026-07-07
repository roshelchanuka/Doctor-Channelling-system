package com.example.doctorchannelling.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.doctorchannelling.model.DoctorSlot;




public interface DoctorSlotRepository extends JpaRepository<DoctorSlot, Integer> {
    
    // To search for all slots related to a specific doctor
    List<DoctorSlot> findByDoctorDoctorId(Integer doctorId);
}
