package com.example.doctorchannelling.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import com.example.doctorchannelling.model.ChatMessage;
import com.example.doctorchannelling.service.ChatService;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessage chatMessage) {
        ChatMessage savedMsg = chatService.saveMessage(chatMessage);
        messagingTemplate.convertAndSendToUser(
                chatMessage.getConversation().getConversationId().toString(),"/queue/messages",
                savedMsg
        );
    }
}
