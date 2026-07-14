package com.example.doctorchannelling.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.doctorchannelling.dto.MedicalRecordDTO;
import com.example.doctorchannelling.dto.PrescriptionDTO;
import com.example.doctorchannelling.model.Appointment;
import com.example.doctorchannelling.model.Doctor;
import com.example.doctorchannelling.model.MedicalRecord;
import com.example.doctorchannelling.model.Patient;
import com.example.doctorchannelling.model.Prescription;
import com.example.doctorchannelling.repository.AppointmentRepository;
import com.example.doctorchannelling.repository.DoctorRepository;
import com.example.doctorchannelling.repository.MedicalRecordRepository;
import com.example.doctorchannelling.repository.PatientRepository;
import com.example.doctorchannelling.repository.PrescriptionRepository;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository, 
                                PrescriptionRepository prescriptionRepository,
                                PatientRepository patientRepository,
                                DoctorRepository doctorRepository,
                                AppointmentRepository appointmentRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional
    public MedicalRecord createMedicalRecord(MedicalRecordDTO dto) {
        Optional<Patient> patientOpt = patientRepository.findById(dto.getPatientId());
        Optional<Doctor> doctorOpt = doctorRepository.findById(dto.getDoctorId());
        
        if (patientOpt.isEmpty() || doctorOpt.isEmpty()) {
            throw new IllegalArgumentException("Patient or Doctor not found");
        }

        MedicalRecord record = new MedicalRecord();
        record.setPatient(patientOpt.get());
        record.setDoctor(doctorOpt.get());
        record.setDiagnosis(dto.getDiagnosis());
        record.setSymptoms(dto.getSymptoms());
        record.setNotes(dto.getNotes());

        if (dto.getAppointmentId() != null) {
            Optional<Appointment> apptOpt = appointmentRepository.findById(dto.getAppointmentId());
            apptOpt.ifPresent(record::setAppointment);
        }

        MedicalRecord savedRecord = medicalRecordRepository.save(record);

        if (dto.getPrescriptions() != null && !dto.getPrescriptions().isEmpty()) {
            for (PrescriptionDTO pDto : dto.getPrescriptions()) {
                Prescription prescription = new Prescription();
                prescription.setMedicalRecord(savedRecord);
                prescription.setMedicineName(pDto.getMedicineName());
                prescription.setDosage(pDto.getDosage());
                prescription.setDuration(pDto.getDuration());
                prescription.setInstructions(pDto.getInstructions());
                prescriptionRepository.save(prescription);
            }
        }

        return savedRecord;
    }

    public List<MedicalRecord> getRecordsByPatient(Integer patientId) {
        return medicalRecordRepository.findByPatient_PatientId(patientId);
    }
}
