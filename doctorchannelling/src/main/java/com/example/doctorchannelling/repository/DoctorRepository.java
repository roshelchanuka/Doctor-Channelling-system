package com.example.doctorchannelling.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.doctorchannelling.model.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Integer> {
    List<Doctor> findBySpecialization(String specialization);
}
