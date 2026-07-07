package com.example.doctorchannelling.repository;

import org.springframework.data.jpa.repository.JpaRepository;


import com.example.doctorchannelling.model.Admin;



public interface AdminRepository extends JpaRepository<Admin, Integer> {
    //All basic CRUD methods are automatically provided by JpaRepository.
}
