package com.example.doctorchannelling.service;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.doctorchannelling.model.Appointment;
import com.example.doctorchannelling.model.DoctorSlot;
import com.example.doctorchannelling.model.Patient;
import com.example.doctorchannelling.model.WaitingList;
import com.example.doctorchannelling.repository.AppointmentRepository;
import com.example.doctorchannelling.repository.DoctorSlotRepository;
import com.example.doctorchannelling.repository.PatientRepository;
import com.example.doctorchannelling.repository.WaitingListRepository;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorSlotRepository doctorSlotRepository;
    private final PatientRepository patientRepository;
    private final WaitingListRepository waitingListRepository;

    private final NotificationService notificationService;

    public AppointmentService(AppointmentRepository appointmentRepository, 
                              DoctorSlotRepository doctorSlotRepository,
                              PatientRepository patientRepository, 
                              WaitingListRepository waitingListRepository,
                              NotificationService notificationService) {
        this.appointmentRepository = appointmentRepository;
        this.doctorSlotRepository = doctorSlotRepository;
        this.patientRepository = patientRepository;
        this.waitingListRepository = waitingListRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Map<String, Object> bookAppointment(Integer patientId, Integer slotId) {
        Map<String, Object> response = new HashMap<>();

        // 1. Checking whether the patient and the relevant slot are in the system
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));


        DoctorSlot slot = doctorSlotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Doctor slot not found with ID: " + slotId));


        //2. Check if the slot is full (CurrentBooked == MaxPatients)
        if (slot.getCurrentBooked() >= slot.getMaxPatients()) {

            
            // 4. If the slot is full: automatically add to the WaitingList
            Integer nextWaitingPosition = waitingListRepository.findMaxQueuePositionBySlotId(slotId) + 1;

            WaitingList waitingEntry = new WaitingList();
            waitingEntry.setSlot(slot);
            waitingEntry.setPatient(patient);
            waitingEntry.setQueuePosition(nextWaitingPosition);

            waitingListRepository.save(waitingEntry);

            // Notify patient
            notificationService.createNotification(patientId, "Doctor slot is full. You have been added to the Waiting List. Your position is: " + nextWaitingPosition);

            response.put("status", "Waiting");
            response.put("message", "Doctor slot is full. You have been added to the Waiting List.");
            response.put("waitingPosition", nextWaitingPosition);
            return response;
        }

        // 3. If there is space in the slot: Book a regular appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setSlot(slot);
        appointment.setAppointmentDate(slot.getAvailableDate());
        appointment.setBookingTime(LocalTime.now());
        

        // Automatically generate Queue Number (Current Booked + 1)
        int nextQueueNumber = slot.getCurrentBooked() + 1;
        appointment.setQueueNumber(nextQueueNumber);
        appointment.setAppointmentStatus("Scheduled");



        // Saving the appointment and updating the DoctorSlot's CurrentBooked count in a single transaction
        Appointment savedAppointment = appointmentRepository.save(appointment);



        // Increase the 'CurrentBooked' count in DoctorSlot by 1 and save
        slot.setCurrentBooked(nextQueueNumber);
        doctorSlotRepository.save(slot);

        // Notify patient and doctor
        notificationService.createNotification(patientId, "Appointment booked successfully for Dr. " + slot.getDoctor().getDoctorName() + " on " + slot.getAvailableDate() + ". Queue No: " + nextQueueNumber);
        notificationService.createNotification(slot.getDoctor().getDoctorId(), "New appointment booked by " + patient.getPatientName() + " for " + slot.getAvailableDate());

        response.put("status", "Confirmed");
        response.put("message", "Appointment booked successfully!");
        response.put("appointmentId", savedAppointment.getAppointmentId());
        response.put("queueNumber", nextQueueNumber);
        
        return response;
    }

    public java.util.List<Appointment> getAppointmentsByDoctor(Integer doctorId) {
        return appointmentRepository.findAppointmentsByDoctorId(doctorId);
    }

    public java.util.List<Appointment> getAppointmentsBySlot(Integer slotId) {
        return appointmentRepository.findAppointmentsBySlotId(slotId);
    }

    @Transactional
    public Appointment updateAppointmentStatus(Integer appointmentId, String newStatus) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));
        appointment.setAppointmentStatus(newStatus);
        
        Appointment savedApp = appointmentRepository.save(appointment);
        
        // Notify patient
        notificationService.createNotification(
            appointment.getPatient().getPatientId(), 
            "Your appointment with Dr. " + appointment.getSlot().getDoctor().getDoctorName() + " on " + appointment.getAppointmentDate() + " has been marked as " + newStatus
        );
        
        return savedApp;
    }

    public java.util.List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
}