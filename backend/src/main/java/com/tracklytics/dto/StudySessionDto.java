package com.tracklytics.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/dto/StudySessionDto.java
 * ============================================================================
 */
@Data
public class StudySessionDto {
    private Long id;
    private Integer durationMinutes;
    private LocalDateTime sessionDate;
    private Integer focusScore;
    private String notes;
    private Long subjectId;
    private String subjectName;
    private String subjectColor;
    private LocalDateTime createdAt;
}
