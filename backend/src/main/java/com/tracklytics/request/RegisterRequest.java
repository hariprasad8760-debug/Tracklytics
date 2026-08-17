package com.tracklytics.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/request/RegisterRequest.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Contains validated fields sent by the frontend during user signup (`/api/v1/auth/register`).
 * ============================================================================
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 50, message = "Full name must be between 2 and 50 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters long")
    private String password;
}
