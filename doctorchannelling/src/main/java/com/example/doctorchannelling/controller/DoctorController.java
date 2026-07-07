package com.example.doctorchannelling.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.doctorchannelling.model.Doctor;
import com.example.doctorchannelling.model.ProfilePicture;
import com.example.doctorchannelling.repository.ProfilePictureRepository;
import com.example.doctorchannelling.service.DoctorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DoctorController {

    private final DoctorService doctorService;
    private final ProfilePictureRepository profilePictureRepository;

    public DoctorController(DoctorService doctorService, ProfilePictureRepository profilePictureRepository) {
        this.doctorService = doctorService;
        this.profilePictureRepository = profilePictureRepository;
    }

    @PostMapping
    public ResponseEntity<Doctor> addDoctor(@Valid @RequestBody Doctor doctor) {
        return ResponseEntity.ok(doctorService.addDoctor(doctor));
    }

    @GetMapping
    public List<Doctor> getDoctors(@RequestParam(required = false) String specialization) {
        if (specialization != null && !specialization.isBlank()) {
            return doctorService.getDoctorsBySpecialization(specialization);
        }
        return doctorService.getAllDoctors();
    }

    @GetMapping("/{id}")
    public ResponseEntity<java.util.Map<String, Object>> getDoctorById(@PathVariable Integer id) {
        Optional<Doctor> doctorOpt = doctorService.getDoctorById(id);
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("doctor", doctor);
            
            String profileImageUrl = null;
            if (doctor.getUser() != null) {
                Optional<ProfilePicture> profilePicOpt = profilePictureRepository.findByUser(doctor.getUser());
                profileImageUrl = profilePicOpt.map(pic -> "/uploads/profiles/" + pic.getStoredFileName()).orElse(null);
            }
            
            response.put("profileImageUrl", profileImageUrl);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Integer id, @Valid @RequestBody Doctor doctor) {
        Optional<Doctor> updatedDoctor = doctorService.updateDoctor(id, doctor);
        return updatedDoctor.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDoctor(@PathVariable Integer id) {
        if (doctorService.deleteDoctor(id)) {
            return ResponseEntity.ok("Doctor deleted successfully!");
        }
        return ResponseEntity.badRequest().body("Doctor not found with ID: " + id);
    }
}
