package com.example.doctorchannelling;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.example.doctorchannelling.model.Patient;
import com.example.doctorchannelling.model.User;
import com.example.doctorchannelling.repository.PatientRepository;
import com.example.doctorchannelling.repository.UserRepository;

@SpringBootApplication
@EnableScheduling
public class DoctorchannellingApplication {

	public static void main(String[] args) {
		SpringApplication.run(DoctorchannellingApplication.class, args);
	}

	@Bean
	public CommandLineRunner createDefaultUser(UserRepository userRepository, PatientRepository patientRepository) {
		return args -> {
			if (userRepository.findByEmailId("test@example.com").isEmpty()) {
				User user = new User();
				user.setEmailId("test@example.com");
				user.setPasswordHash(new BCryptPasswordEncoder().encode("password123"));
				user.setRole("Patient");
				user.setVerified(true);
				userRepository.save(user);

				Patient patient = new Patient();
				patient.setUser(user);
				patient.setPatientName("Test Patient");
				patient.setMobileNumber("0712345678");
				patient.setCity("Colombo");
				patient.setAge(25);
				patientRepository.save(patient);
				
				System.out.println("Default test user created: test@example.com / password123");
			}
		};
	}
}
