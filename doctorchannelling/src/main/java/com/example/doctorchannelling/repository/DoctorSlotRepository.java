package com.example.doctorchannelling.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.doctorchannelling.model.DoctorSlot;




public interface DoctorSlotRepository extends JpaRepository<DoctorSlot, Integer> {
    
    // To search for all active slots related to a specific doctor
    List<DoctorSlot> findByDoctorDoctorIdAndIsExpiredFalse(Integer doctorId);
    
    // To search for all slots related to a specific doctor (including expired)
    List<DoctorSlot> findByDoctorDoctorId(Integer doctorId);

    // Find slots that should be expired
    @org.springframework.data.jpa.repository.Query("SELECT s FROM DoctorSlot s WHERE s.isExpired = false AND (s.availableDate < :currentDate OR (s.availableDate = :currentDate AND s.endTime < :currentTime))")
    List<DoctorSlot> findSlotsToExpire(@org.springframework.data.repository.query.Param("currentDate") java.time.LocalDate currentDate, @org.springframework.data.repository.query.Param("currentTime") java.time.LocalTime currentTime);
}
