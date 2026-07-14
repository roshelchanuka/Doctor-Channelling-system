package com.example.doctorchannelling.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.doctorchannelling.dto.ReviewDTO;
import com.example.doctorchannelling.model.Doctor;
import com.example.doctorchannelling.model.Patient;
import com.example.doctorchannelling.model.Review;
import com.example.doctorchannelling.repository.DoctorRepository;
import com.example.doctorchannelling.repository.PatientRepository;
import com.example.doctorchannelling.repository.ReviewRepository;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public ReviewService(ReviewRepository reviewRepository, DoctorRepository doctorRepository, PatientRepository patientRepository) {
        this.reviewRepository = reviewRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    public Review addReview(ReviewDTO reviewDTO) {
        Optional<Patient> patientOpt = patientRepository.findById(reviewDTO.getPatientId());
        Optional<Doctor> doctorOpt = doctorRepository.findById(reviewDTO.getDoctorId());

        if (patientOpt.isEmpty() || doctorOpt.isEmpty()) {
            throw new IllegalArgumentException("Patient or Doctor not found");
        }

        Doctor doctor = doctorOpt.get();
        Patient patient = patientOpt.get();

        // 1. Save the new review
        Review review = new Review();
        review.setPatient(patient);
        review.setDoctor(doctor);
        review.setRating(reviewDTO.getRating());
        review.setComment(reviewDTO.getComment());
        Review savedReview = reviewRepository.save(review);

        // 2. Recalculate average rating for the doctor
        List<Review> doctorReviews = reviewRepository.findByDoctor_DoctorId(doctor.getDoctorId());
        
        int totalReviews = doctorReviews.size();
        double sum = 0;
        for (Review r : doctorReviews) {
            sum += r.getRating();
        }
        
        double newAvg = (totalReviews > 0) ? (sum / totalReviews) : 0.0;
        BigDecimal bd = new BigDecimal(newAvg).setScale(2, RoundingMode.HALF_UP);

        doctor.setTotalReviews(totalReviews);
        doctor.setAverageRating(bd);
        doctorRepository.save(doctor);

        return savedReview;
    }

    public List<Review> getReviewsByDoctorId(Integer doctorId) {
        return reviewRepository.findByDoctor_DoctorId(doctorId);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @org.springframework.transaction.annotation.Transactional
    public boolean deleteReview(Integer reviewId) {
        Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
        if (reviewOpt.isPresent()) {
            Review review = reviewOpt.get();
            Doctor doctor = review.getDoctor();
            
            reviewRepository.deleteById(reviewId);
            
            // Recalculate average rating for the doctor
            List<Review> doctorReviews = reviewRepository.findByDoctor_DoctorId(doctor.getDoctorId());
            
            int totalReviews = doctorReviews.size();
            double sum = 0;
            for (Review r : doctorReviews) {
                sum += r.getRating();
            }
            
            double newAvg = (totalReviews > 0) ? (sum / totalReviews) : 0.0;
            BigDecimal bd = new BigDecimal(newAvg).setScale(2, RoundingMode.HALF_UP);

            doctor.setTotalReviews(totalReviews);
            doctor.setAverageRating(bd);
            doctorRepository.save(doctor);
            
            return true;
        }
        return false;
    }
}
