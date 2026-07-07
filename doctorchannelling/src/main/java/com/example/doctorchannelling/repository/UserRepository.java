package com.example.doctorchannelling.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.doctorchannelling.model.User;

public interface UserRepository extends JpaRepository<User, Integer> {
    
    
    Optional<User> findByEmailId(String emailId);
}
