package com.example.doctorchannelling.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.doctorchannelling.model.UserSession;

public interface UserSessionRepository extends JpaRepository<UserSession, Integer> {
    // If necessary, methods for retrieving session tokens later can be included here.
}
