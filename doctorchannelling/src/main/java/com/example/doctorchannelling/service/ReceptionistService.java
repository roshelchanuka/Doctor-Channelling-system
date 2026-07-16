package com.example.doctorchannelling.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.doctorchannelling.model.Receptionist;
import com.example.doctorchannelling.model.User;
import com.example.doctorchannelling.repository.ReceptionistRepository;
import com.example.doctorchannelling.repository.UserRepository;

@Service
public class ReceptionistService {

    private final ReceptionistRepository receptionistRepository;
    private final UserRepository userRepository;

    public ReceptionistService(ReceptionistRepository receptionistRepository, UserRepository userRepository) {
        this.receptionistRepository = receptionistRepository;
        this.userRepository = userRepository;
    }

    public Receptionist completeProfile(Integer userId, Receptionist receptionist) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (!"Receptionist".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("User is not a Receptionist!");
        }

        if (receptionistRepository.existsById(userId)) {
            throw new RuntimeException("Profile already completed for this user.");
        }

        receptionist.setUser(user);
        return receptionistRepository.save(receptionist);
    }

    public Optional<Receptionist> getProfileDetails(Integer receptionistId) {
        return receptionistRepository.findById(receptionistId);
    }
}
