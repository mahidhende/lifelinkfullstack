package com.Lifelink.Lifelink.controller;

import com.Lifelink.Lifelink.model.BloodStock;
import com.Lifelink.Lifelink.model.DonationRequest;
import com.Lifelink.Lifelink.model.PatientBloodRequest;
import com.Lifelink.Lifelink.service.LifeLinkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bloodbank")
@CrossOrigin(origins = "*")
public class BloodBankController {

    @Autowired
    private LifeLinkService lifeLinkService;

    @GetMapping("/stock/{bloodBankId}")
    public ResponseEntity<List<BloodStock>> getStock(@PathVariable Long bloodBankId) {
        return ResponseEntity.ok(lifeLinkService.getBloodBankStock(bloodBankId));
    }

    @PostMapping("/stock/add")
    public ResponseEntity<BloodStock> addOrUpdateStock(@RequestBody Map<String, Object> body) {
        Long bloodBankId = Long.parseLong(body.get("bloodBankId").toString());
        String bloodGroup = (String) body.get("bloodGroup");
        Integer quantityMl = Integer.parseInt(body.get("quantityMl").toString());
        BloodStock updated = lifeLinkService.addOrUpdateStock(bloodBankId, bloodGroup, quantityMl);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/donor-requests/{bloodBankId}")
    public ResponseEntity<List<DonationRequest>> getDonorRequests(@PathVariable Long bloodBankId) {
        return ResponseEntity.ok(lifeLinkService.getBloodBankDonorRequests(bloodBankId));
    }

    @PostMapping("/donor-requests/status")
    public ResponseEntity<DonationRequest> updateDonationStatus(@RequestBody Map<String, Object> body) {
        Long donationId = Long.parseLong(body.get("donationId").toString());
        String status = (String) body.get("status");
        DonationRequest updated = lifeLinkService.updateDonationStatus(donationId, status);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/patient-requests/pending")
    public ResponseEntity<List<PatientBloodRequest>> getPendingPatientRequests() {
        return ResponseEntity.ok(lifeLinkService.getAllPendingPatientRequests());
    }

    @PostMapping("/patient-requests/accept")
    public ResponseEntity<PatientBloodRequest> acceptPatientRequest(@RequestBody Map<String, Object> body) {
        Long requestId = Long.parseLong(body.get("requestId").toString());
        Long bloodBankId = Long.parseLong(body.get("bloodBankId").toString());
        PatientBloodRequest accepted = lifeLinkService.acceptPatientRequestByBank(requestId, bloodBankId);
        return ResponseEntity.ok(accepted);
    }
}
