package com.tracklytics.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/entity/StudySubject.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Represents study academic or professional subjects tracked by the user.
 *
 * WHAT THIS FILE DOES:
 *   Maps to `study_subjects` table in MySQL database.
 * ============================================================================
 */
@Entity
@Table(name = "study_subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudySubject extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "color_code")
    private String colorCode; // UI accent hex color e.g. #3b82f6

    @Column(name = "target_hours_per_week")
    private Double targetHoursPerWeek;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
