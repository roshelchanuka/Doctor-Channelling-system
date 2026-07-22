package com.example.doctorchannelling.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.doctorchannelling.model.Admin;
import com.example.doctorchannelling.model.Doctor;
import com.example.doctorchannelling.model.Patient;
import com.example.doctorchannelling.model.Receptionist;
import com.example.doctorchannelling.model.User;
import com.example.doctorchannelling.repository.AdminRepository;
import com.example.doctorchannelling.repository.DoctorRepository;
import com.example.doctorchannelling.repository.PatientRepository;
import com.example.doctorchannelling.repository.ReceptionistRepository;
import com.example.doctorchannelling.repository.UserRepository;

/**
 * DataSeeder - Application startup වලදී test users automatically insert කරයි.
 * Each role (Admin, Doctor, Patient) සඳහා Users table + role-specific table දෙකම populate කරයි.
 * Already exist කරන emails skip කරයි — safe to run multiple times.
 */
@Component
@Profile("!prod")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final ReceptionistRepository receptionistRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            UserRepository userRepository,
            AdminRepository adminRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            ReceptionistRepository receptionistRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.receptionistRepository = receptionistRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedAdmin("admin@docChannel.com",   "Admin@123",   "System Admin",  "0771234567");
        seedDoctor("doctor@docChannel.com", "Doctor@123",  "Dr. John Silva", "Cardiology", new BigDecimal("2500.00"));
        seedPatient("patient@docChannel.com","Patient@123", "Kamal Perera",  "0712345678");
        seedReceptionist("receptionist@docChannel.com", "Receptionist@123", "Nimali", "0711122334");

        System.out.println("\n====================================================");
        System.out.println("  TEST ACCOUNTS (Doctor Channelling System)");
        System.out.println("====================================================");
        System.out.println("  ADMIN        : admin@docChannel.com   / Admin@123");
        System.out.println("  DOCTOR       : doctor@docChannel.com  / Doctor@123");
        System.out.println("  PATIENT      : patient@docChannel.com / Patient@123");
        System.out.println("  RECEPTIONIST : receptionist@docChannel.com / Receptionist@123");
        System.out.println("====================================================\n");
    }

    private void seedReceptionist(String email, String rawPassword, String name, String contact) {
        if (userRepository.findByEmailId(email).isPresent()) {
            return;
        }
        User user = buildUser(email, rawPassword, "Receptionist");
        userRepository.save(user);

        Receptionist receptionist = new Receptionist();
        receptionist.setUser(user);
        receptionist.setReceptionistName(name);
        receptionist.setContactNumber(contact);
        receptionistRepository.save(receptionist);
        System.out.println("[DataSeeder] Created Receptionist: " + email);
    }

    // ── Admin ──────────────────────────────────────────────────────────────────
    private void seedAdmin(String email, String rawPassword, String name, String contact) {
        if (userRepository.findByEmailId(email).isPresent()) {
            System.out.println("[DataSeeder] Skipped (already exists): " + email);
            return;
        }

        User user = buildUser(email, rawPassword, "Admin");
        userRepository.save(user);

        Admin admin = new Admin();
        admin.setUser(user);
        admin.setAdminName(name);
        admin.setContactNumber(contact);
        adminRepository.save(admin);

        System.out.println("[DataSeeder] Created Admin: " + email);
    }

    // ── Doctor ─────────────────────────────────────────────────────────────────
    private void seedDoctor(String email, String rawPassword, String name,
                            String specialization, BigDecimal fee) {
        if (userRepository.findByEmailId(email).isPresent()) {
            System.out.println("[DataSeeder] Skipped (already exists): " + email);
            return;
        }

        User user = buildUser(email, rawPassword, "Doctor");
        userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setDoctorName(name);
        doctor.setSpecialization(specialization);
        doctor.setConsultationFee(fee);
        doctorRepository.save(doctor);

        System.out.println("[DataSeeder] Created Doctor: " + email);
    }

    // ── Patient ────────────────────────────────────────────────────────────────
    private void seedPatient(String email, String rawPassword, String name, String mobile) {
        if (userRepository.findByEmailId(email).isPresent()) {
            System.out.println("[DataSeeder] Skipped (already exists): " + email);
            return;
        }

        User user = buildUser(email, rawPassword, "Patient");
        userRepository.save(user);

        Patient patient = new Patient();
        patient.setUser(user);
        patient.setPatientName(name);
        patient.setMobileNumber(mobile);
        patientRepository.save(patient);

        System.out.println("[DataSeeder] Created Patient: " + email);
    }

    // ── Shared User builder ────────────────────────────────────────────────────
    private User buildUser(String email, String rawPassword, String role) {
        User user = new User();
        user.setEmailId(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setVerified(true);       // OTP bypass — test account
        user.setActive(true);
        user.setFailedLoginAttempts(0);
        user.setCreatedAt(LocalDateTime.now());
        return user;
    }
}
