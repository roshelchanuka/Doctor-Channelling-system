package com.example.doctorchannelling.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.doctorchannelling.model.Appointment;




public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {

    // To search for appointments that are between 3 hours and 30 minutes from now
    // and that have not yet been reminded
    @Query("SELECT a FROM Appointment a WHERE a.slot.availableDate = :currentDate " +
            "AND a.slot.startTime >= :startTimeStart AND a.slot.startTime <= :startTimeEnd " +
            "AND a.isReminderSent = false")

    List<Appointment> findAppointmentsForReminder(
            @Param("currentDate") java.time.LocalDate currentDate,
            @Param("startTimeStart") java.time.LocalTime startTimeStart,
            @Param("startTimeEnd") java.time.LocalTime startTimeEnd);

    @Query("SELECT a FROM Appointment a WHERE a.patient.patientId = :patientId AND a.appointmentDate >= CURRENT_DATE ORDER BY a.appointmentDate ASC, a.slot.startTime ASC")
    List<Appointment> findUpcomingAppointmentsByPatientId(@Param("patientId") Integer patientId);

    @Query("SELECT a FROM Appointment a WHERE a.patient.patientId = :patientId AND a.appointmentDate < CURRENT_DATE ORDER BY a.appointmentDate DESC, a.slot.startTime DESC")
    List<Appointment> findPastAppointmentsByPatientId(@Param("patientId") Integer patientId);

    @Query("SELECT a FROM Appointment a WHERE a.slot.doctor.doctorId = :doctorId ORDER BY a.appointmentDate DESC, a.slot.startTime DESC")
    List<Appointment> findAppointmentsByDoctorId(@Param("doctorId") Integer doctorId);

    @Query("SELECT a FROM Appointment a WHERE a.slot.slotId = :slotId ORDER BY a.queueNumber ASC")
    List<Appointment> findAppointmentsBySlotId(@Param("slotId") Integer slotId);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE " +
           "(:startDate IS NULL OR a.appointmentDate >= :startDate) " +
           "AND (:endDate IS NULL OR a.appointmentDate <= :endDate)")
    long countAppointmentsByDateRange(@Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);

    @Query("SELECT COUNT(DISTINCT a.patient.patientId) FROM Appointment a WHERE " +
           "(:startDate IS NULL OR a.appointmentDate >= :startDate) " +
           "AND (:endDate IS NULL OR a.appointmentDate <= :endDate)")
    long countUniquePatientsByDateRange(@Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);

    @Query("SELECT a.slot.doctor.doctorName, COUNT(a) as appCount FROM Appointment a WHERE " +
           "(:startDate IS NULL OR a.appointmentDate >= :startDate) " +
           "AND (:endDate IS NULL OR a.appointmentDate <= :endDate) " +
           "GROUP BY a.slot.doctor.doctorId, a.slot.doctor.doctorName " +
           "ORDER BY appCount DESC")
    List<Object[]> findTopDoctorsByAppointmentCount(@Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate, org.springframework.data.domain.Pageable pageable);
}
