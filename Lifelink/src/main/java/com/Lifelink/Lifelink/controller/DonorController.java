package com.Lifelink.Lifelink.controller;

import com.Lifelink.Lifelink.model.DonationRequest;
import com.Lifelink.Lifelink.model.User;
import com.Lifelink.Lifelink.service.LifeLinkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donor")
@CrossOrigin(origins = "*")
public class DonorController {

    @Autowired
    private LifeLinkService lifeLinkService;

    @PostMapping("/donate")
    public ResponseEntity<DonationRequest> donateBlood(@RequestBody DonationRequest request) {
        DonationRequest created = lifeLinkService.createDonationRequest(request);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/history/{donorId}")
    public ResponseEntity<List<DonationRequest>> getDonationHistory(@PathVariable Long donorId) {
        List<DonationRequest> history = lifeLinkService.getDonorDonationHistory(donorId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/blood-banks")
    public ResponseEntity<List<User>> getBloodBanks() {
        return ResponseEntity.ok(lifeLinkService.getAllUsersByRole("BLOOD_BANK"));
    }
}
