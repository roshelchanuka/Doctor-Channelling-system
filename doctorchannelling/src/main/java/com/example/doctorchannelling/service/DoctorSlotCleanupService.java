package com.example.doctorchannelling.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.doctorchannelling.model.Appointment;
import com.example.doctorchannelling.model.DoctorSlot;
import com.example.doctorchannelling.repository.AppointmentRepository;
import com.example.doctorchannelling.repository.DoctorSlotRepository;

@Service
public class DoctorSlotCleanupService {

    private final DoctorSlotRepository doctorSlotRepository;
    private final AppointmentRepository appointmentRepository;

    public DoctorSlotCleanupService(DoctorSlotRepository doctorSlotRepository, AppointmentRepository appointmentRepository) {
        this.doctorSlotRepository = doctorSlotRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // Runs every hour and on startup
    @Scheduled(cron = "0 0 * * * *")
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void cleanupExpiredSlots() {
        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();

        List<DoctorSlot> slotsToExpire = doctorSlotRepository.findSlotsToExpire(currentDate, currentTime);

        for (DoctorSlot slot : slotsToExpire) {
            slot.setExpired(true);
            doctorSlotRepository.save(slot);

            // Cancel any "Scheduled" appointments for this expired slot
            List<Appointment> scheduledAppointments = appointmentRepository.findBySlotSlotIdAndAppointmentStatus(slot.getSlotId(), "Scheduled");
            for (Appointment appointment : scheduledAppointments) {
                appointment.setAppointmentStatus("Cancelled");
                appointmentRepository.save(appointment);
            }
            
            // Also cancel "Rescheduled" appointments if any
            List<Appointment> rescheduledAppointments = appointmentRepository.findBySlotSlotIdAndAppointmentStatus(slot.getSlotId(), "Rescheduled");
            for (Appointment appointment : rescheduledAppointments) {
                appointment.setAppointmentStatus("Cancelled");
                appointmentRepository.save(appointment);
            }
        }

        if (!slotsToExpire.isEmpty()) {
            System.out.println("Cleaned up " + slotsToExpire.size() + " expired doctor slots at " + currentDate + " " + currentTime);
        }
    }
}
