package com.example.doctorchannelling.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.doctorchannelling.model.Patient;
import com.example.doctorchannelling.service.PatientService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    // 1. Profile completion (e.g. /api/patients/5/profile)
    @PostMapping("/{userId}/profile")
    public ResponseEntity<?> completeProfile(@PathVariable Integer userId, @Valid @RequestBody Patient patient) {
        try {
            Patient savedPatient = patientService.completeProfile(userId, patient);
            return ResponseEntity.ok(savedPatient);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 2. Profile update (e.g. /api/patients/5/profile)
    @PutMapping("/{patientId}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Integer patientId, @Valid @RequestBody Patient patient) {
        Optional<Patient> updatedPatient = patientService.updateProfile(patientId, patient);
        if (updatedPatient.isPresent()) {
            return ResponseEntity.ok(updatedPatient.get());
        }
        return ResponseEntity.notFound().build();
    }

    //3. Getting profile details
    @GetMapping("/{patientId}")
    public ResponseEntity<Patient> getProfileDetails(@PathVariable Integer patientId) {
        Optional<Patient> patient = patientService.getProfileDetails(patientId);
        return patient.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 4. Getting the full patient dashboard
    @GetMapping("/{patientId}/dashboard")
    public ResponseEntity<?> getPatientDashboard(@PathVariable Integer patientId) {
        try {
            Map<String, Object> dashboardData = patientService.getPatientDashboard(patientId);
            return ResponseEntity.ok(dashboardData);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<java.util.List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }
}