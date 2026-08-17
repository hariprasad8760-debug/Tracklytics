package com.tracklytics.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/dto/UserDto.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   DTO (Data Transfer Object) used to return user profile info without exposing 
 *   the encrypted password field.
 * ============================================================================
 */
@Data
public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String role;
    private Boolean enabled;
    private LocalDateTime createdAt;
}
