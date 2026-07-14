package com.example.doctorchannelling.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.doctorchannelling.model.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Integer> {
    List<Doctor> findBySpecialization(String specialization);

    @Query("SELECT d FROM Doctor d WHERE " +
           "(:name IS NULL OR LOWER(d.doctorName) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:specialization IS NULL OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :specialization, '%'))) AND " +
           "(:city IS NULL OR LOWER(d.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:hospital IS NULL OR LOWER(d.hospital) LIKE LOWER(CONCAT('%', :hospital, '%')))")
    List<Doctor> searchDoctors(@Param("name") String name,
                               @Param("specialization") String specialization,
                               @Param("city") String city,
                               @Param("hospital") String hospital);
}
