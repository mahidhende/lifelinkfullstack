package com.Lifelink.Lifelink.controller;

import com.Lifelink.Lifelink.model.PatientBloodRequest;
import com.Lifelink.Lifelink.service.LifeLinkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private LifeLinkService lifeLinkService;

    @PostMapping("/request-blood")
    public ResponseEntity<PatientBloodRequest> createBloodRequest(@RequestBody PatientBloodRequest request) {
        PatientBloodRequest created = lifeLinkService.createPatientBloodRequest(request);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/requests/{patientId}")
    public ResponseEntity<List<PatientBloodRequest>> getPatientRequests(@PathVariable Long patientId) {
        List<PatientBloodRequest> requests = lifeLinkService.getPatientRequests(patientId);
        return ResponseEntity.ok(requests);
    }
}
