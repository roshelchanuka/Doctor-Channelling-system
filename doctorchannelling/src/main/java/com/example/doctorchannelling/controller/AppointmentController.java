package com.example.doctorchannelling.controller;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.doctorchannelling.service.AppointmentService;
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService appointmentService;
    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }
    // Endpoint for booking an appointment (e.g. /api/appointments/book)
    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody Map<String, Integer> request) {
        Integer patientId = request.get("patientId");
        Integer slotId = request.get("slotId");
        if (patientId == null || slotId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "patientId and slotId are required parameters."));
        }
        try {
            Map<String, Object> bookingResult = appointmentService.bookAppointment(patientId, slotId);
            return ResponseEntity.ok(bookingResult);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @org.springframework.web.bind.annotation.GetMapping("/doctor/{doctorId}")
    public ResponseEntity<java.util.List<com.example.doctorchannelling.model.Appointment>> getAppointmentsByDoctor(@org.springframework.web.bind.annotation.PathVariable Integer doctorId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctor(doctorId));
    }
    @org.springframework.web.bind.annotation.GetMapping("/slot/{slotId}")
    public ResponseEntity<java.util.List<com.example.doctorchannelling.model.Appointment>> getAppointmentsBySlot(@org.springframework.web.bind.annotation.PathVariable Integer slotId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsBySlot(slotId));
    }
    @org.springframework.web.bind.annotation.PutMapping("/{appointmentId}/status")
    public ResponseEntity<?> updateAppointmentStatus(@org.springframework.web.bind.annotation.PathVariable Integer appointmentId, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required."));
        }
        try {
            com.example.doctorchannelling.model.Appointment updated = appointmentService.updateAppointmentStatus(appointmentId, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @org.springframework.web.bind.annotation.GetMapping
    public ResponseEntity<java.util.List<com.example.doctorchannelling.model.Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }
}
