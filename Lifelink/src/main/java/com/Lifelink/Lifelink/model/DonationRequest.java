package com.Lifelink.Lifelink.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donation_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long donorId;
    private String donorName;
    private String donorPhone;

    @Column(nullable = false)
    private Long bloodBankId;
    private String bloodBankName;

    @Column(nullable = false)
    private String bloodGroup;

    @Column(nullable = false)
    private Integer quantityMl;

    private String status; // PENDING, ACCEPTED, REJECTED, COMPLETED

    private String notes;

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
