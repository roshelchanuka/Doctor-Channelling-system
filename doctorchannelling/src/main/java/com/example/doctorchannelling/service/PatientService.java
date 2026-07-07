package com.example.doctorchannelling.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.doctorchannelling.model.Patient;
import com.example.doctorchannelling.model.User;
import com.example.doctorchannelling.model.Appointment;
import com.example.doctorchannelling.model.WaitingList;
import com.example.doctorchannelling.model.ProfilePicture;
import com.example.doctorchannelling.repository.PatientRepository;
import com.example.doctorchannelling.repository.UserRepository;
import com.example.doctorchannelling.repository.AppointmentRepository;
import com.example.doctorchannelling.repository.WaitingListRepository;
import com.example.doctorchannelling.repository.ProfilePictureRepository;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final WaitingListRepository waitingListRepository;
    private final ProfilePictureRepository profilePictureRepository;

    public PatientService(PatientRepository patientRepository, 
                          UserRepository userRepository,
                          AppointmentRepository appointmentRepository,
                          WaitingListRepository waitingListRepository,
                          ProfilePictureRepository profilePictureRepository) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.waitingListRepository = waitingListRepository;
        this.profilePictureRepository = profilePictureRepository;
    }

    // 1. Completing the patient profile for the first time (Create Profile)
    @Transactional
    public Patient completeProfile(Integer userId, Patient patientData) {


        // Checking to see if there is a user matching the UserID sent first.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // If this user has already created a profile, they will not be allowed to create one again.
        if (patientRepository.existsById(userId)) {
            throw new RuntimeException("Patient profile already exists for this user!");
        }



        // The User object must be associated with the Patient because of @MapsId.
        patientData.setUser(user);
        patientData.setPatientId(userId); // Matches the ID

        return patientRepository.save(patientData);
    }

    // 2. Updating the existing patient profile (Update Profile)
    @Transactional
    public Optional<Patient> updateProfile(Integer patientId, Patient updatedData) {
        return patientRepository.findById(patientId).map(existingPatient -> {
            existingPatient.setPatientName(updatedData.getPatientName());
            existingPatient.setMobileNumber(updatedData.getMobileNumber());
            existingPatient.setCity(updatedData.getCity());
            existingPatient.setAge(updatedData.getAge());
            existingPatient.setMedicalHistory(updatedData.getMedicalHistory());
            return patientRepository.save(existingPatient);
        });
    }

    

    // 3. Getting the patient profile details (Get Profile Details)
    public Optional<Patient> getProfileDetails(Integer patientId) {
        return patientRepository.findById(patientId);
    }

    // 4. Getting the full patient dashboard data
    public Map<String, Object> getPatientDashboard(Integer patientId) {
        Map<String, Object> dashboardData = new HashMap<>();
        
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (patientOpt.isEmpty()) {
            throw new RuntimeException("Patient not found with ID: " + patientId);
        }
        
        Patient patient = patientOpt.get();
        List<Appointment> upcomingAppointments = appointmentRepository.findUpcomingAppointmentsByPatientId(patientId);
        List<Appointment> pastAppointments = appointmentRepository.findPastAppointmentsByPatientId(patientId);
        List<WaitingList> waitingList = waitingListRepository.findByPatient_PatientId(patientId);
        
        dashboardData.put("profile", patient);
        
        Optional<ProfilePicture> profilePicOpt = profilePictureRepository.findByUser(patient.getUser());
        String profileImageUrl = profilePicOpt.map(pic -> "/uploads/profiles/" + pic.getStoredFileName()).orElse(null);
        dashboardData.put("profileImageUrl", profileImageUrl);
        dashboardData.put("upcomingAppointments", upcomingAppointments);
        dashboardData.put("pastAppointments", pastAppointments);
        dashboardData.put("waitingList", waitingList);
        
        return dashboardData;
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }
}