package com.example.doctorchannelling.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "ProfilePictures")
public class ProfilePicture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ProfilePictureID")
    private Integer profilePictureId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "UserID", nullable = false, unique = true)
    private User user;

    @NotBlank
    @Column(name = "StoredFileName", nullable = false, unique = true, length = 100)
    private String storedFileName;

    @Column(name = "OriginalFileName", length = 255)
    private String originalFileName;

    @NotBlank
    @Pattern(regexp = "jpg|jpeg|png")
    @Column(name = "FileExtension", nullable = false, length = 10)
    private String fileExtension;

    @NotNull
    @Column(name = "FileSizeKB", nullable = false)
    private Integer fileSizeKB;

    @Column(name = "UploadedAt", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    void prePersist() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }

    public Integer getProfilePictureId() { return profilePictureId; }
    public void setProfilePictureId(Integer profilePictureId) { this.profilePictureId = profilePictureId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getStoredFileName() { return storedFileName; }
    public void setStoredFileName(String storedFileName) { this.storedFileName = storedFileName; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getFileExtension() { return fileExtension; }
    public void setFileExtension(String fileExtension) { this.fileExtension = fileExtension; }

    public Integer getFileSizeKB() { return fileSizeKB; }
    public void setFileSizeKB(Integer fileSizeKB) { this.fileSizeKB = fileSizeKB; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
