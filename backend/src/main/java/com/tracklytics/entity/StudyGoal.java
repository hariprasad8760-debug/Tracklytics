package com.tracklytics.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/entity/StudyGoal.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Tracks study milestones and goals set by the user.
 *
 * WHAT THIS FILE DOES:
 *   Maps to `study_goals` table in MySQL database.
 * ============================================================================
 */
@Entity
@Table(name = "study_goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyGoal extends BaseEntity {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "target_hours", nullable = false)
    private Double targetHours;

    @Column(name = "achieved_hours")
    @Builder.Default
    private Double achievedHours = 0.0;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "is_completed")
    @Builder.Default
    private Boolean isCompleted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private StudySubject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
