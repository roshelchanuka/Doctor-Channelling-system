package com.example.doctorchannelling.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.doctorchannelling.model.ChatConversation;
import com.example.doctorchannelling.model.ChatMessage;
import com.example.doctorchannelling.repository.ChatConversationRepository;
import com.example.doctorchannelling.repository.ChatMessageRepository;
import java.util.List;

@Service
public class ChatService {
    @Autowired
    private ChatConversationRepository conversationRepo;
    
    @Autowired
    private ChatMessageRepository messageRepo;

    public ChatMessage saveMessage(ChatMessage message) {
        return messageRepo.save(message);
    }

    public List<ChatMessage> getConversationMessages(Integer conversationId) {
        return messageRepo.findByConversationConversationIdOrderBySentAtAsc(conversationId);
    }
}
