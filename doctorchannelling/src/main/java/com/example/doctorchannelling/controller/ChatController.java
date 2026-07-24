package com.example.doctorchannelling.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import com.example.doctorchannelling.dto.ChatMessageDTO;
import com.example.doctorchannelling.model.ChatMessage;
import com.example.doctorchannelling.service.ChatService;

@Controller
public class ChatController {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private ChatService chatService;
    
    @MessageMapping("/chat.sendMessage")
    public void processMessage(@Payload ChatMessageDTO chatMessageDTO) {
        ChatMessage savedMsg = chatService.saveMessageFromDTO(chatMessageDTO);
        
        ChatMessageDTO responseDto = new ChatMessageDTO();
        responseDto.setMessageId(savedMsg.getMessageId());
        if (savedMsg.getConversation() != null) {
            responseDto.setConversationId(savedMsg.getConversation().getConversationId());
        }
        if (savedMsg.getSender() != null) {
            responseDto.setSenderId(savedMsg.getSender().getUserId());
        }
        responseDto.setMessageContent(savedMsg.getMessageText());
        responseDto.setSentAt(savedMsg.getSentAt());
        responseDto.setIsRead(savedMsg.isRead());

        messagingTemplate.convertAndSend(
                "/topic/chat/" + chatMessageDTO.getConversationId(),
                responseDto
        );
    }
}
