package com.tracklytics.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/entity/StudySession.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Represents logged study sessions recorded by the user.
 *
 * WHAT THIS FILE DOES:
 *   Maps to `study_sessions` table in MySQL database.
 * ============================================================================
 */
@Entity
@Table(name = "study_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudySession extends BaseEntity {

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "session_date", nullable = false)
    private LocalDateTime sessionDate;

    @Column(name = "focus_score")
    private Integer focusScore; // Productivity score (1 to 100)

    @Column(name = "notes", length = 1000)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private StudySubject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
