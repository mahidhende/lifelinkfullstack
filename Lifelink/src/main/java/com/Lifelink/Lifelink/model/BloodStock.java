package com.Lifelink.Lifelink.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blood_stocks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long bloodBankId;

    private String bloodBankName;

    @Column(nullable = false)
    private String bloodGroup; // A+, A-, B+, B-, AB+, AB-, O+, O-

    @Column(nullable = false)
    private Integer quantityMl;

    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    public void onSave() {
        this.lastUpdated = LocalDateTime.now();
    }
}
