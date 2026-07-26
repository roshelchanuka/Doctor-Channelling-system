package com.example.doctorchannelling.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.doctorchannelling.model.Patient;
import com.example.doctorchannelling.model.User;
import com.example.doctorchannelling.repository.PatientRepository;
import com.example.doctorchannelling.repository.UserRepository;

@Service
public class WalkInBookingService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final AppointmentService appointmentService;
    private final PaymentService paymentService;
    private final PasswordEncoder passwordEncoder;

    public WalkInBookingService(UserRepository userRepository, 
                                PatientRepository patientRepository,
                                AppointmentService appointmentService, 
                                PaymentService paymentService,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.appointmentService = appointmentService;
        this.paymentService = paymentService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Map<String, Object> processWalkInBooking(Map<String, Object> request) {
        String patientName = (String) request.get("patientName");
        String patientMobile = (String) request.get("patientMobile");
        Integer slotId = (Integer) request.get("slotId");
        String paymentMethod = (String) request.get("paymentMethod");
        Integer receptionistId = request.containsKey("receptionistId") ? (Integer) request.get("receptionistId") : null;

        if (patientName == null || patientMobile == null || slotId == null || paymentMethod == null) {
            throw new RuntimeException("Missing required fields for walk-in booking.");
        }

        // 1. Find or Create Patient
        // Assuming mobile number is unique enough for walk-ins. In a real app, maybe search by mobile.
        // Let's check if a patient exists by mobile number.
        Optional<Patient> existingPatient = patientRepository.findAll().stream()
                .filter(p -> patientMobile.equals(p.getMobileNumber()))
                .findFirst();

        Integer patientId;
        if (existingPatient.isPresent()) {
            patientId = existingPatient.get().getPatientId();
        } else {
            // Create a new User
            User newUser = new User();
            newUser.setEmailId("walkin_" + patientMobile + "@docchannel.local");
            newUser.setPasswordHash(passwordEncoder.encode("Walkin@123")); // default password
            newUser.setRole("Patient");
            newUser.setVerified(true);
            User savedUser = userRepository.save(newUser);

            // Create new Patient
            Patient newPatient = new Patient();
            newPatient.setUser(savedUser);
            newPatient.setPatientId(savedUser.getUserId());
            newPatient.setPatientName(patientName);
            newPatient.setMobileNumber(patientMobile);
            Patient savedPatient = patientRepository.save(newPatient);
            
            patientId = savedPatient.getPatientId();
        }

        // 2. Book Appointment
        Map<String, Object> bookingResult = appointmentService.bookAppointment(patientId, slotId);
        Integer appointmentId = (Integer) bookingResult.get("appointmentId");

        // 3. Record Payment
        Map<String, Object> paymentRequest = new HashMap<>();
        paymentRequest.put("appointmentId", appointmentId);
        paymentRequest.put("paymentMethod", paymentMethod);
        if (receptionistId != null) {
            paymentRequest.put("receptionistId", receptionistId);
        }
        
        com.example.doctorchannelling.model.Payment payment = paymentService.recordPayment(paymentRequest);

        // 4. Return combined result for the receipt
        Map<String, Object> finalResult = new HashMap<>();
        finalResult.put("appointmentId", appointmentId);
        finalResult.put("queueNumber", bookingResult.get("queueNumber"));
        finalResult.put("patientName", patientName);
        finalResult.put("patientMobile", patientMobile);
        finalResult.put("payment", payment);
        
        return finalResult;
    }
}
