package com.example.doctorchannelling.repository;

import com.example.doctorchannelling.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByAppointment_AppointmentId(Integer appointmentId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'Completed' " +
           "AND (:startDate IS NULL OR p.paymentDate >= :startDate) " +
           "AND (:endDate IS NULL OR p.paymentDate <= :endDate)")
    BigDecimal sumCompletedPayments(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
