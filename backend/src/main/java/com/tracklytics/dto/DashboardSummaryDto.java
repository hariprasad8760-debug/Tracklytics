package com.tracklytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/dto/DashboardSummaryDto.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Single high-performance summary object returned to the React Dashboard landing view.
 * ============================================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {

    private BigDecimal totalExpensesThisMonth;
    private Double expenseChangePercentage;
    
    private Double totalStudyHoursThisMonth;
    private Double studyHoursChangePercentage;
    
    private Double averageFocusScore;
    private Integer activeGoalCount;

    private List<ExpenseDto> recentTransactions;
    private List<SubjectProgressDto> topSubjectsProgress;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SubjectProgressDto {
        private String subjectName;
        private Double hoursLogged;
        private Double targetHours;
        private Integer progressPercentage;
        private String colorCode;
    }
}
