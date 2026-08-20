package com.Lifelink.Lifelink.dto;

import lombok.Data;

@Data
public class SendOtpRequest {
    private String email;
    private String role;
}
