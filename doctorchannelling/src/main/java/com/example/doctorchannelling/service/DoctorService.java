package com.example.doctorchannelling.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.doctorchannelling.model.Doctor;
import com.example.doctorchannelling.repository.DoctorRepository;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public Doctor addDoctor(Doctor doctor) {
        if (doctor.getSlots() != null) {
            doctor.getSlots().forEach(slot -> slot.setDoctor(doctor));
        }
        return doctorRepository.save(doctor);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public List<Doctor> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization);
    }

    public List<Doctor> searchDoctors(String name, String specialization, String city, String hospital) {
        return doctorRepository.searchDoctors(name, specialization, city, hospital);
    }

    public Optional<Doctor> getDoctorById(Integer id) {
        return doctorRepository.findById(id);
    }

    public Optional<Doctor> updateDoctor(Integer id, Doctor doctor) {
        return doctorRepository.findById(id).map(existingDoctor -> {
            existingDoctor.setDoctorName(doctor.getDoctorName());
            existingDoctor.setSpecialization(doctor.getSpecialization());
            existingDoctor.setConsultationFee(doctor.getConsultationFee());
            existingDoctor.setCity(doctor.getCity());
            existingDoctor.setHospital(doctor.getHospital());
            existingDoctor.setExperienceYears(doctor.getExperienceYears());
            existingDoctor.setSlots(doctor.getSlots());
            if (existingDoctor.getSlots() != null) {
                existingDoctor.getSlots().forEach(slot -> slot.setDoctor(existingDoctor));
            }
            return doctorRepository.save(existingDoctor);
        });
    }

    public boolean deleteDoctor(Integer id) {
        if (doctorRepository.existsById(id)) {
            doctorRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
