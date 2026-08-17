package com.tracklytics.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/request/StudySessionRequest.java
 * ============================================================================
 */
@Data
public class StudySessionRequest {

    @NotNull(message = "Duration in minutes is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    @NotNull(message = "Session date is required")
    private LocalDateTime sessionDate;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @Min(value = 1, message = "Focus score minimum is 1")
    @Max(value = 100, message = "Focus score maximum is 100")
    private Integer focusScore = 80;

    private String notes;
}
