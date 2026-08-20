package com.Lifelink.Lifelink.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_blood_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientBloodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;
    private String patientName;
    private String patientPhone;

    @Column(nullable = false)
    private String bloodGroup;

    @Column(nullable = false)
    private Integer unitsInMl;

    private String hospitalName;
    private String deliveryAddress;
    private String urgencyLevel; // LOW, MEDIUM, CRITICAL

    // Global Status across all banks: PENDING, ACCEPTED, FULFILLED, REJECTED
    private String status;

    private Long acceptedByBankId;
    private String acceptedByBankName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
