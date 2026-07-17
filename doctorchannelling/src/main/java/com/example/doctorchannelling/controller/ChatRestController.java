package com.example.doctorchannelling.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.doctorchannelling.service.ChatService;
import com.example.doctorchannelling.model.ChatConversation;
import com.example.doctorchannelling.model.ChatMessage;
import com.example.doctorchannelling.dto.ChatConversationDTO;
import com.example.doctorchannelling.dto.ChatMessageDTO;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatRestController {

    @Autowired
    private ChatService chatService;

    @GetMapping("/conversations/receptionist/{receptionistId}")
    public ResponseEntity<List<ChatConversationDTO>> getConversationsForReceptionist(@PathVariable Integer receptionistId) {
        List<ChatConversation> convs = chatService.getConversationsForReceptionist(receptionistId);
        List<ChatConversationDTO> dtos = convs.stream().map(this::convertToConversationDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/conversations/patient/{patientId}")
    public ResponseEntity<ChatConversationDTO> getOrCreateConversationForPatient(@PathVariable Integer patientId) {
        try {
            ChatConversation conv = chatService.getOrCreateConversationForPatient(patientId);
            return ResponseEntity.ok(convertToConversationDTO(conv));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getConversationMessages(@PathVariable Integer conversationId) {
        List<ChatMessage> messages = chatService.getConversationMessages(conversationId);
        List<ChatMessageDTO> dtos = messages.stream().map(this::convertToMessageDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private ChatConversationDTO convertToConversationDTO(ChatConversation conv) {
        ChatConversationDTO dto = new ChatConversationDTO();
        dto.setConversationId(conv.getConversationId());
        if (conv.getPatient() != null) {
            dto.setPatientId(conv.getPatient().getPatientId());
            dto.setPatientName(conv.getPatient().getPatientName());
        }
        if (conv.getReceptionist() != null) {
            dto.setReceptionistId(conv.getReceptionist().getReceptionistId());
        }
        dto.setStatus(conv.getStatus());
        dto.setStartedAt(conv.getStartedAt());
        dto.setClosedAt(conv.getClosedAt());
        dto.setLastMessageAt(conv.getLastMessageAt());
        return dto;
    }

    private ChatMessageDTO convertToMessageDTO(ChatMessage msg) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setMessageId(msg.getMessageId());
        if (msg.getConversation() != null) {
            dto.setConversationId(msg.getConversation().getConversationId());
        }
        if (msg.getSender() != null) {
            dto.setSenderId(msg.getSender().getUserId());
        }
        dto.setMessageContent(msg.getMessageText());
        dto.setSentAt(msg.getSentAt());
        dto.setIsRead(msg.isRead());
        return dto;
    }
}
