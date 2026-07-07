package com.example.doctorchannelling.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.doctorchannelling.model.Admin;
import com.example.doctorchannelling.model.User;
import com.example.doctorchannelling.repository.AdminRepository;
import com.example.doctorchannelling.repository.UserRepository;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;

    public AdminService(AdminRepository adminRepository, UserRepository userRepository) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
    }

    // 1. Creating an administrator profile for the first time (Create Profile)

    @Transactional
    public Admin createAdminProfile(Integer userId, Admin adminData) {


        // Checking if a user exists for the given UserID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));


        // Checking if the user is authorized as an Admin
        if (!"Admin".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("The user role is not authorized as an Admin!");
        }

        // Prevent this user from creating an Admin profile if it already has one.
        if (adminRepository.existsById(userId)) {
            throw new RuntimeException("Admin profile already exists for this user!");
        }

        //Correctly placing the @MapsId link between Admin and User
        adminData.setUser(user);
        adminData.setAdminId(userId);

        return adminRepository.save(adminData);
    }



    // 2. Updating administrator profile details (Update Profile)
    @Transactional
    public Optional<Admin> updateAdminProfile(Integer adminId, Admin updatedData) {
        return adminRepository.findById(adminId).map(existingAdmin -> {
            existingAdmin.setAdminName(updatedData.getAdminName());
            existingAdmin.setContactNumber(updatedData.getContactNumber());
            return adminRepository.save(existingAdmin);
        });
    }



    // 3. Getting administrator profile details (Get Profile Details)
    public Optional<Admin> getAdminProfileDetails(Integer adminId) {
        return adminRepository.findById(adminId);
    }

    public java.util.List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }
}