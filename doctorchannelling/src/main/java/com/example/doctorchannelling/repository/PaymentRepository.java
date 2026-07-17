package com.example.doctorchannelling.repository;

import com.example.doctorchannelling.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByAppointment_AppointmentId(Integer appointmentId);
}
