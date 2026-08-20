package com.Lifelink.Lifelink.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientRequestId;

    private String patientName;
    private String patientPhone;
    private String deliveryAddress;

    private Long bloodBankId;
    private String bloodBankName;
    private String bloodBankAddress;

    private String bloodGroup;
    private Integer unitsInMl;

    private Long deliveryBoyId;
    private String deliveryBoyName;
    private String deliveryBoyPhone;

    // Common delivery status: PENDING_ASSIGNMENT, ACCEPTED, IN_TRANSIT, DELIVERED
    @Column(nullable = false)
    private String status;

    private LocalDateTime assignedTime;
    private LocalDateTime pickedUpTime;
    private LocalDateTime deliveredTime;

    @PrePersist
    public void onCreate() {
        this.assignedTime = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING_ASSIGNMENT";
        }
    }
}
