package com.tracklytics.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/entity/User.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Represents the user account entity mapped to the `users` database table in MySQL.
 *
 * WHAT THIS FILE DOES:
 *   1. `@Entity`: Marks this class as a JPA persistent entity.
 *   2. `@Table(name = "users")`: Specifies table name in MySQL database.
 *   3. Holds authentication credentials (email, BCrypt hashed password, role).
 * ============================================================================
 */
@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Builder.Default
    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;
}
