package com.example.doctorchannelling.repository;

import org.springframework.data.jpa.repository.JpaRepository;


import com.example.doctorchannelling.model.Patient;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

public interface PatientRepository extends JpaRepository<Patient, Integer> {
    
    @Query("SELECT COUNT(p) FROM Patient p WHERE p.user.isActive = :isActive " +
           "AND (:startDate IS NULL OR p.user.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR p.user.createdAt <= :endDate)")
    long countPatientsByActiveStatusAndDateRange(@Param("isActive") boolean isActive, 
                                                 @Param("startDate") LocalDateTime startDate, 
                                                 @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(p) FROM Patient p WHERE " +
           "(:startDate IS NULL OR p.user.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR p.user.createdAt <= :endDate)")
    long countTotalPatientsByDateRange(@Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate);
}
