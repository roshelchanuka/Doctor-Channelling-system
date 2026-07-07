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
        
        slot.setDoctor(doctor);
        return doctorSlotRepository.save(slot);
    }

    public Optional<DoctorSlot> updateSlot(Integer slotId, DoctorSlot slotDetails) {
        return doctorSlotRepository.findById(slotId).map(existingSlot -> {
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
}
