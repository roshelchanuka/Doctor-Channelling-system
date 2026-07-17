package com.example.doctorchannelling.controller;

import com.example.doctorchannelling.model.Payment;
import com.example.doctorchannelling.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/record")
    public ResponseEntity<?> recordPayment(@RequestBody Map<String, Object> request) {
        try {
            Payment savedPayment = paymentService.recordPayment(request);
            return ResponseEntity.ok(savedPayment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<Payment>> getPaymentsByAppointment(@PathVariable Integer appointmentId) {
        return ResponseEntity.ok(paymentService.getPaymentsByAppointment(appointmentId));
    }
}
