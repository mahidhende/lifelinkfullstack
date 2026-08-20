package com.Lifelink.Lifelink.controller;

import com.Lifelink.Lifelink.model.Notification;
import com.Lifelink.Lifelink.service.LifeLinkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private LifeLinkService lifeLinkService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(lifeLinkService.getUserNotifications(userId));
    }
}
