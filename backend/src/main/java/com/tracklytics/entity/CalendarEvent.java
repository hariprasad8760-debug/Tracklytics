package com.tracklytics.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/entity/CalendarEvent.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Stores interactive planner calendar events, study slots, and expense reminders.
 *
 * WHAT THIS FILE DOES:
 *   Maps to `calendar_events` table in MySQL database.
 * ============================================================================
 */
@Entity
@Table(name = "calendar_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarEvent extends BaseEntity {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "event_type")
    private String eventType; // STUDY_SESSION, EXPENSE_DUE, EXAM_REVISION, GENERAL

    @Column(name = "color_code")
    private String colorCode;

    @Column(name = "is_all_day")
    @Builder.Default
    private Boolean isAllDay = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
