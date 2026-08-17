package com.tracklytics.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/entity/UserSettings.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Stores user preference settings (currency, theme mode, daily study targets).
 *
 * WHAT THIS FILE DOES:
 *   Maps to `user_settings` table in MySQL database.
 * ============================================================================
 */
@Entity
@Table(name = "user_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettings extends BaseEntity {

    @Column(name = "currency")
    @Builder.Default
    private String currency = "USD";

    @Column(name = "theme_mode")
    @Builder.Default
    private String themeMode = "DARK";

    @Column(name = "daily_study_target_hours")
    @Builder.Default
    private Double dailyStudyTargetHours = 4.0;

    @Column(name = "monthly_expense_budget")
    @Builder.Default
    private Double monthlyExpenseBudget = 5000.0;

    @Column(name = "email_notifications_enabled")
    @Builder.Default
    private Boolean emailNotificationsEnabled = true;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
}
