package com.example.doctorchannelling.repository;

import org.springframework.data.jpa.repository.JpaRepository;


import com.example.doctorchannelling.model.Patient;


public interface PatientRepository extends JpaRepository<Patient, Integer> {
    // All basic CRUD methods are automatically provided by JpaRepository.
}
