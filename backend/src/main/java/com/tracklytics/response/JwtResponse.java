package com.tracklytics.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/response/JwtResponse.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Returned to the React client upon successful authentication (`/api/v1/auth/login`), 
 *   containing the JWT bearer token, user ID, email, and security role.
 * ============================================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {

    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Long id;
    private String fullName;
    private String email;
    private String role;
}
