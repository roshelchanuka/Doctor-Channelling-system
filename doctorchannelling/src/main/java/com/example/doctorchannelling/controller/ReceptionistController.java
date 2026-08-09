package com.example.doctorchannelling.controller;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.doctorchannelling.model.Receptionist;
import com.example.doctorchannelling.service.ReceptionistService;
import com.example.doctorchannelling.service.WalkInBookingService;


@RestController
@RequestMapping("/api/receptionists")
public class ReceptionistController {
    private final ReceptionistService receptionistService;
    private final WalkInBookingService walkInBookingService;
    
    public ReceptionistController(ReceptionistService receptionistService, WalkInBookingService walkInBookingService) {
        this.receptionistService = receptionistService;
        this.walkInBookingService = walkInBookingService;
    }


    // 3. Walk-in Booking & Payment Endpoint
    @PostMapping("/walkin-book")
    public ResponseEntity<?> processWalkInBooking(@RequestBody Map<String, Object> request) {
        try {
            Map<String, Object> result = walkInBookingService.processWalkInBooking(request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
