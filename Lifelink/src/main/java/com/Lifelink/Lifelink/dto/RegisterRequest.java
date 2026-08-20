package com.Lifelink.Lifelink.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private String role; // DONOR, PATIENT, BLOOD_BANK, DELIVERY_BOY
    private String bloodGroup;
    private String address;
    private String licenseNumber;
    private String hospitalName;
}
