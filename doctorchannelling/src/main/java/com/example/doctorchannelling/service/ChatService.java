package com.example.doctorchannelling.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.doctorchannelling.model.ChatConversation;
import com.example.doctorchannelling.model.ChatMessage;
import com.example.doctorchannelling.repository.ChatConversationRepository;
import com.example.doctorchannelling.repository.ChatMessageRepository;
import com.example.doctorchannelling.repository.UserRepository;
import com.example.doctorchannelling.model.User;
import com.example.doctorchannelling.dto.ChatMessageDTO;
import java.util.List;

@Service
public class ChatService {
    @Autowired
    private ChatConversationRepository conversationRepo;
    
    @Autowired
    private ChatMessageRepository messageRepo;

    @Autowired
    private com.example.doctorchannelling.repository.PatientRepository patientRepo;

    @Autowired
    private com.example.doctorchannelling.repository.ReceptionistRepository receptionistRepo;

    @Autowired
    private UserRepository userRepo;

    public ChatMessage saveMessage(ChatMessage message) {
        if (message.getConversation() != null && message.getConversation().getConversationId() != null) {
            ChatConversation conv = conversationRepo.findById(message.getConversation().getConversationId()).orElse(null);
            if (conv != null) {
                conv.setLastMessageAt(java.time.LocalDateTime.now());
                conversationRepo.save(conv);
            }
        }
        return messageRepo.save(message);
    }

    public ChatMessage saveMessageFromDTO(ChatMessageDTO dto) {
        ChatMessage message = new ChatMessage();
        
        ChatConversation conv = conversationRepo.findById(dto.getConversationId())
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        message.setConversation(conv);
        
        User sender = userRepo.findById(dto.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        message.setSender(sender);
        
        // Use email or a generic name as fallback since User table doesn't have Name
        message.setSenderName(sender.getEmailId() != null ? sender.getEmailId() : "User");
        
        message.setMessageText(dto.getMessageContent());
        message.setSentAt(java.time.LocalDateTime.now());
        message.setMessageType("TEXT");
        message.setRead(false);
        message.setDeleted(false);
        
        ChatMessage saved = messageRepo.save(message);
        
        conv.setLastMessageAt(saved.getSentAt());
        conversationRepo.save(conv);
        
        return saved;
    }

    public List<ChatMessage> getConversationMessages(Integer conversationId) {
        return messageRepo.findByConversationConversationIdOrderBySentAtAsc(conversationId);
    }

    public List<ChatConversation> getConversationsForReceptionist(Integer receptionistId) {
        return conversationRepo.findByReceptionistReceptionistId(receptionistId);
    }

    public ChatConversation getOrCreateConversationForPatient(Integer patientId) {
        List<ChatConversation> convs = conversationRepo.findByPatientPatientId(patientId);
        // Find the first OPEN conversation
        for (ChatConversation c : convs) {
            if ("OPEN".equalsIgnoreCase(c.getStatus())) {
                return c;
            }
        }

        // Create new if none exists
        com.example.doctorchannelling.model.Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Get any receptionist (e.g., first one)
        List<com.example.doctorchannelling.model.Receptionist> receptionists = receptionistRepo.findAll();
        if (receptionists.isEmpty()) {
            throw new RuntimeException("No receptionists available to take the chat");
        }
        com.example.doctorchannelling.model.Receptionist receptionist = receptionists.get(0);

        ChatConversation newConv = new ChatConversation();
        newConv.setPatient(patient);
        newConv.setReceptionist(receptionist);
        newConv.setStatus("OPEN");
        newConv.setStartedAt(java.time.LocalDateTime.now());

        return conversationRepo.save(newConv);
    }

    public void closeConversation(Integer conversationId) {
        ChatConversation conv = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        conv.setStatus("CLOSED");
        conv.setClosedAt(java.time.LocalDateTime.now());
        conversationRepo.save(conv);
    }
}
