package com.example.doctorchannelling.controller;
import java.util.List;
import java.util.Map;
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
import org.springframework.web.bind.annotation.RestController;
import com.example.doctorchannelling.model.DoctorSlot;
import com.example.doctorchannelling.service.DoctorSlotService;
import jakarta.validation.Valid;
@RestController
@RequestMapping("/api/slots")
public class DoctorSlotController {
    private final DoctorSlotService doctorSlotService;
    public DoctorSlotController(DoctorSlotService doctorSlotService) {
        this.doctorSlotService = doctorSlotService;
    }
    @GetMapping("/doctor/{doctorId}")
    public List<DoctorSlot> getSlotsByDoctor(@PathVariable Integer doctorId) {
        return doctorSlotService.getSlotsByDoctor(doctorId);
    }
    @PostMapping("/doctor/{doctorId}")
    public ResponseEntity<?> addSlot(@PathVariable Integer doctorId, @Valid @RequestBody DoctorSlot slot) {
        try {
            DoctorSlot createdSlot = doctorSlotService.addSlot(doctorId, slot);
            return ResponseEntity.ok(createdSlot);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @PutMapping("/{slotId}")
    public ResponseEntity<?> updateSlot(@PathVariable Integer slotId, @Valid @RequestBody DoctorSlot slotDetails) {
        Optional<DoctorSlot> updatedSlot = doctorSlotService.updateSlot(slotId, slotDetails);
        return updatedSlot.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{slotId}")
    public ResponseEntity<?> deleteSlot(@PathVariable Integer slotId) {
        try {
            if (doctorSlotService.deleteSlot(slotId)) {
                return ResponseEntity.ok(Map.of("message", "Slot deleted successfully!"));
            }
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
