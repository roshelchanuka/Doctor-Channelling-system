package com.example.doctorchannelling.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;


import com.example.doctorchannelling.model.ProfilePicture;
import com.example.doctorchannelling.model.User;


public interface ProfilePictureRepository extends JpaRepository<ProfilePicture, Integer> {
    Optional<ProfilePicture> findByUser(User user);
    Optional<ProfilePicture> findByUser_UserId(Integer userId);
}
