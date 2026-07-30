package com.example.doctorchannelling.controller;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping; 
import org.springframework.web.bind.annotation.RestController;

import com.example.doctorchannelling.dto.MedicalRecordDTO;
import com.example.doctorchannelling.model.MedicalRecord;
import com.example.doctorchannelling.service.MedicalRecordService;
@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;
    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }
    @PostMapping
    public ResponseEntity<?> addMedicalRecord(@RequestBody MedicalRecordDTO dto) {
        try {
            MedicalRecord savedRecord = medicalRecordService.createMedicalRecord(dto);
            return ResponseEntity.ok(savedRecord);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to save medical record");
        }
    }
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecord>> getRecordsByPatient(@PathVariable Integer patientId) {
        return ResponseEntity.ok(medicalRecordService.getRecordsByPatient(patientId));
    }
}
