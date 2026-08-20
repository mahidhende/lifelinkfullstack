package com.Lifelink.Lifelink.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    // Roles: DONOR, PATIENT, BLOOD_BANK, DELIVERY_BOY
    @Column(nullable = false)
    private String role;

    private String bloodGroup;
    private String address;

    // Optional identifiers
    private String licenseNumber; // for delivery boy or blood bank reg id
    private String hospitalName;  // for patient if associated
}
