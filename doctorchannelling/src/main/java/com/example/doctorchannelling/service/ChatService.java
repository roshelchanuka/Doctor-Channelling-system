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

    @Autowired
    private com.example.doctorchannelling.repository.PatientRepository patientRepo;

    @Autowired
    private com.example.doctorchannelling.repository.ReceptionistRepository receptionistRepo;

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
}
