package com.example.doctorchannelling.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.doctorchannelling.model.ChatMessage;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {
    List<ChatMessage> findByConversationConversationIdOrderBySentAtAsc(Integer conversationId);
}
