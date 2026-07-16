package com.example.doctorchannelling.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.doctorchannelling.model.ChatConversation;
import java.util.List;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Integer> {
    List<ChatConversation> findByPatientPatientId(Integer patientId);
    List<ChatConversation> findByReceptionistReceptionistId(Integer receptionistId);
}
