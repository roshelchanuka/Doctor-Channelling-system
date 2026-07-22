package com.example.doctorchannelling.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.doctorchannelling.model.Review;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByDoctor_DoctorId(Integer doctorId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE " +
           "(:startDate IS NULL OR r.reviewDate >= :startDate) " +
           "AND (:endDate IS NULL OR r.reviewDate <= :endDate)")
    Double getAverageRatingByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
