package com.example.doctorchannelling.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.doctorchannelling.model.Doctor;
import com.example.doctorchannelling.model.DoctorSlot;
import com.example.doctorchannelling.repository.DoctorRepository;
import com.example.doctorchannelling.repository.DoctorSlotRepository;

@Service
public class DoctorSlotService {

    private final DoctorSlotRepository doctorSlotRepository;
    private final DoctorRepository doctorRepository;

    public DoctorSlotService(DoctorSlotRepository doctorSlotRepository, DoctorRepository doctorRepository) {
        this.doctorSlotRepository = doctorSlotRepository;
        this.doctorRepository = doctorRepository;
    }

    public List<DoctorSlot> getSlotsByDoctor(Integer doctorId) {
        return doctorSlotRepository.findByDoctorDoctorId(doctorId);
    }

    public DoctorSlot addSlot(Integer doctorId, DoctorSlot slot) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));
        
        validateSlotOverlap(doctorId, slot.getAvailableDate(), slot.getStartTime(), slot.getEndTime(), null);
        
        slot.setDoctor(doctor);
        return doctorSlotRepository.save(slot);
    }

    public Optional<DoctorSlot> updateSlot(Integer slotId, DoctorSlot slotDetails) {
        return doctorSlotRepository.findById(slotId).map(existingSlot -> {
            validateSlotOverlap(existingSlot.getDoctor().getDoctorId(), slotDetails.getAvailableDate(), slotDetails.getStartTime(), slotDetails.getEndTime(), slotId);
            
            existingSlot.setAvailableDate(slotDetails.getAvailableDate());
            existingSlot.setStartTime(slotDetails.getStartTime());
            existingSlot.setEndTime(slotDetails.getEndTime());
            existingSlot.setMaxPatients(slotDetails.getMaxPatients());
            return doctorSlotRepository.save(existingSlot);
        });
    }

    public boolean deleteSlot(Integer slotId) {
        return doctorSlotRepository.findById(slotId).map(slot -> {
            if (slot.getCurrentBooked() > 0) {
                throw new RuntimeException("Cannot delete slot with existing appointments. Please cancel them first.");
            }
            doctorSlotRepository.delete(slot);
            return true;
        }).orElse(false);
    }

    private void validateSlotOverlap(Integer doctorId, java.time.LocalDate newDate, java.time.LocalTime newStart, java.time.LocalTime newEnd, Integer excludeSlotId) {
        List<DoctorSlot> existingSlots = doctorSlotRepository.findByDoctorDoctorId(doctorId);
        for (DoctorSlot existing : existingSlots) {
            if (excludeSlotId != null && existing.getSlotId().equals(excludeSlotId)) {
                continue;
            }
            if (existing.getAvailableDate().equals(newDate)) {
                if (newStart.isBefore(existing.getEndTime()) && existing.getStartTime().isBefore(newEnd)) {
                    throw new RuntimeException("Slot time overlaps with an existing slot on this date.");
                }
            }
        }
    }
}
