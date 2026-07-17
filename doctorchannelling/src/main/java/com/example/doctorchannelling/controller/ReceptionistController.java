package com.example.doctorchannelling.controller;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.doctorchannelling.model.Receptionist;
import com.example.doctorchannelling.service.ReceptionistService;
import jakarta.validation.Valid;
@RestController
@RequestMapping("/api/receptionists")
public class ReceptionistController {
    private final ReceptionistService receptionistService;
    public ReceptionistController(ReceptionistService receptionistService) {
        this.receptionistService = receptionistService;
    }
    // 1. Profile completion (e.g. /api/receptionists/5/profile)
    @PostMapping("/{userId}/profile")
    public ResponseEntity<?> completeProfile(@PathVariable Integer userId, @Valid @RequestBody Receptionist receptionist) {
        try {
            Receptionist savedReceptionist = receptionistService.completeProfile(userId, receptionist);
            return ResponseEntity.ok(savedReceptionist);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    // 2. Getting profile details
    @GetMapping("/{receptionistId}")
    public ResponseEntity<Receptionist> getProfileDetails(@PathVariable Integer receptionistId) {
        Optional<Receptionist> receptionist = receptionistService.getProfileDetails(receptionistId);
        return receptionist.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
