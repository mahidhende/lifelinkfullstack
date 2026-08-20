package com.Lifelink.Lifelink.controller;

import com.Lifelink.Lifelink.model.DeliveryTask;
import com.Lifelink.Lifelink.service.LifeLinkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
@CrossOrigin(origins = "*")
public class DeliveryController {

    @Autowired
    private LifeLinkService lifeLinkService;

    @GetMapping("/tasks")
    public ResponseEntity<List<DeliveryTask>> getAllTasks() {
        return ResponseEntity.ok(lifeLinkService.getAllDeliveryTasks());
    }

    @GetMapping("/tasks/boy/{deliveryBoyId}")
    public ResponseEntity<List<DeliveryTask>> getBoyTasks(@PathVariable Long deliveryBoyId) {
        return ResponseEntity.ok(lifeLinkService.getDeliveryTasksForBoy(deliveryBoyId));
    }

    @PostMapping("/tasks/status")
    public ResponseEntity<DeliveryTask> updateDeliveryStatus(@RequestBody Map<String, Object> body) {
        Long taskId = Long.parseLong(body.get("taskId").toString());
        Long deliveryBoyId = body.get("deliveryBoyId") != null ? Long.parseLong(body.get("deliveryBoyId").toString())
                : null;
        String status = (String) body.get("status");

        DeliveryTask updated = lifeLinkService.updateDeliveryStatus(taskId, deliveryBoyId, status);
        return ResponseEntity.ok(updated);
    }
}
