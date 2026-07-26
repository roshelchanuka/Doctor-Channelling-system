package com.example.doctorchannelling.service;

import com.example.doctorchannelling.model.Appointment;
import com.example.doctorchannelling.model.Payment;
import com.example.doctorchannelling.model.Receptionist;
import com.example.doctorchannelling.repository.AppointmentRepository;
import com.example.doctorchannelling.repository.PaymentRepository;
import com.example.doctorchannelling.repository.ReceptionistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final ReceptionistRepository receptionistRepository;

    public PaymentService(PaymentRepository paymentRepository, AppointmentRepository appointmentRepository, ReceptionistRepository receptionistRepository) {
        this.paymentRepository = paymentRepository;
        this.appointmentRepository = appointmentRepository;
        this.receptionistRepository = receptionistRepository;
    }

    @Transactional
    public Payment recordPayment(Map<String, Object> request) {
        Integer appointmentId = (Integer) request.get("appointmentId");
        String paymentMethod = (String) request.get("paymentMethod");
        Integer receptionistId = request.containsKey("receptionistId") ? (Integer) request.get("receptionistId") : null;

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Receptionist receptionist = null;
        if (receptionistId != null) {
            receptionist = receptionistRepository.findById(receptionistId)
                    .orElseThrow(() -> new RuntimeException("Receptionist not found"));
        }

        // The SQL trigger trg_Payments_ValidateAmount requires the payment amount to exactly match
        // the doctor's consultation fee. We fetch it here automatically as requested.
        BigDecimal fee = appointment.getSlot().getDoctor().getConsultationFee();

        Payment payment = new Payment();
        payment.setAppointment(appointment);
        payment.setReceptionist(receptionist);
        payment.setAmount(fee);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus("Completed");

        // If it's a card/online payment, the gateway details would normally be set here.
        // For cash, we just save it as completed.

        return paymentRepository.save(payment);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getPaymentsByAppointment(Integer appointmentId) {
        return paymentRepository.findByAppointment_AppointmentId(appointmentId);
    }

    public List<Map<String, Object>> getPendingBills() {
        List<Appointment> unpaidAppointments = appointmentRepository.findUnpaidAppointments();
        List<Map<String, Object>> pendingBills = new ArrayList<>();
        
        for (Appointment app : unpaidAppointments) {
            Map<String, Object> billData = new HashMap<>();
            billData.put("appointmentId", app.getAppointmentId());
            billData.put("patientName", app.getPatient().getPatientName());
            billData.put("patientMobile", app.getPatient().getMobileNumber());
            billData.put("doctorName", app.getSlot().getDoctor().getDoctorName());
            billData.put("appointmentDate", app.getAppointmentDate());
            billData.put("appointmentTime", app.getSlot().getStartTime());
            billData.put("queueNumber", app.getQueueNumber());
            billData.put("consultationFee", app.getSlot().getDoctor().getConsultationFee());
            pendingBills.add(billData);
        }
        
        return pendingBills;
    }
}
