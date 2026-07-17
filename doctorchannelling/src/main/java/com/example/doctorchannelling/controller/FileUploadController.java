package com.example.doctorchannelling.controller;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.example.doctorchannelling.model.ProfilePicture;
import com.example.doctorchannelling.model.User;
import com.example.doctorchannelling.repository.ProfilePictureRepository;
import com.example.doctorchannelling.repository.UserRepository;
@RestController
@RequestMapping("/api/upload")
public class FileUploadController {
    private final UserRepository userRepository;
    private final ProfilePictureRepository profilePictureRepository;
    private final String UPLOAD_DIR = "uploads/profiles/";
    public FileUploadController(UserRepository userRepository, ProfilePictureRepository profilePictureRepository) {
        this.userRepository = userRepository;
        this.profilePictureRepository = profilePictureRepository;
        // Create directory if it doesn't exist
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            System.err.println("Could not create upload directory: " + e.getMessage());
        }
    }
    @PostMapping("/profile-picture/{userId}")
    public ResponseEntity<?> uploadProfilePicture(@PathVariable Integer userId, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found.");
            }
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = "";
            int i = originalFileName.lastIndexOf('.');
            if (i > 0) {
                fileExtension = originalFileName.substring(i + 1).toLowerCase();
            }
            if (!fileExtension.matches("jpg|jpeg|png")) {
                return ResponseEntity.badRequest().body("Invalid file type. Only JPG, JPEG, and PNG are allowed.");
            }
            long sizeKB = file.getSize() / 1024;
            if (sizeKB > 5120) {
                return ResponseEntity.badRequest().body("File size exceeds the 5MB limit.");
            }
            String storedFileName = UUID.randomUUID().toString() + "." + fileExtension;
            Path targetLocation = Paths.get(UPLOAD_DIR).resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            User user = userOptional.get();
            ProfilePicture profilePic = profilePictureRepository.findByUser(user).orElse(new ProfilePicture());
            profilePic.setUser(user);
            profilePic.setStoredFileName(storedFileName);
            profilePic.setOriginalFileName(originalFileName);
            profilePic.setFileExtension(fileExtension);
            profilePic.setFileSizeKB((int) sizeKB);
            profilePictureRepository.save(profilePic);
            String fileDownloadUri = "/uploads/profiles/" + storedFileName;
            return ResponseEntity.ok().body("{\"message\": \"File uploaded successfully\", \"url\": \"" + fileDownloadUri + "\"}");
        } catch (IOException ex) {
            return ResponseEntity.internalServerError().body("Could not store file. Please try again!");
        }
    }
}
