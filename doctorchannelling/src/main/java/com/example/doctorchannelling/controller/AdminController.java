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
import org.springframework.security.access.prepost.PreAuthorize;
import com.example.doctorchannelling.model.Admin;
import com.example.doctorchannelling.service.AdminService;
import jakarta.validation.Valid;
@RestController
@RequestMapping("/api/admins")
@PreAuthorize("hasRole('Admin')")
public class AdminController {
    private final AdminService adminService;
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }
    // 1. Creating an administrator profile for the first time
    @PostMapping("/{userId}/profile")
    public ResponseEntity<?> createAdminProfile(@PathVariable Integer userId, @Valid @RequestBody Admin admin) {
        try {
            Admin savedAdmin = adminService.createAdminProfile(userId, admin);
            return ResponseEntity.ok(savedAdmin);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    // 2. Updating administrator profile details
    @PutMapping("/{adminId}/profile")
    public ResponseEntity<?> updateAdminProfile(@PathVariable Integer adminId, @Valid @RequestBody Admin admin) {
        Optional<Admin> updatedAdmin = adminService.updateAdminProfile(adminId, admin);
        if (updatedAdmin.isPresent()) {
            return ResponseEntity.ok(updatedAdmin.get());
        }
        return ResponseEntity.notFound().build();
    }
    // 3. Retrieving administrator profile details
    @GetMapping("/{adminId}")
    public ResponseEntity<Admin> getAdminProfileDetails(@PathVariable Integer adminId) {
        Optional<Admin> admin = adminService.getAdminProfileDetails(adminId);
        return admin.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    @GetMapping
    public ResponseEntity<java.util.List<Admin>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }
}
