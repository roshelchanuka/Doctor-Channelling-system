package com.example.doctorchannelling.service;

import java.security.SecureRandom;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public String generateOTP() {
        int number = 100000 + SECURE_RANDOM.nextInt(900000);
        return String.valueOf(number);
    }

    public void sendOTPEmail(String toEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Health Care - Verify Your Account");
        message.setText("Welcome to Health Care System!\n\n"
                + "Your One-Time Password (OTP) for registration is: " + otpCode + "\n\n"
                + "This OTP is valid for 5 minutes. Please do not share this code with anyone.");

        System.out.println("====== OTP FOR " + toEmail + " IS: " + otpCode + " ======");
        // mailSender.send(message);
    }

    public void sendPasswordResetEmail(String toEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Health Care - Password Reset");
        message.setText("Welcome to Health Care System!\n\n"
                + "Your One-Time Password (OTP) for password reset is: " + otpCode + "\n\n"
                + "This OTP is valid for 5 minutes. Please do not share this code with anyone.");

        System.out.println("====== PASSWORD RESET OTP FOR " + toEmail + " IS: " + otpCode + " ======");
        // mailSender.send(message);
    }
}
