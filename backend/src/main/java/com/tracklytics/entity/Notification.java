package com.tracklytics.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/entity/Notification.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Stores in-app notifications for users.
 *
 * WHAT THIS FILE DOES:
 *   Maps to `notifications` table in MySQL database.
 * ============================================================================
 */
@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Column(name = "type")
    private String type; // SYSTEM, STUDY_REMINDER, EXPENSE_ALERT

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
