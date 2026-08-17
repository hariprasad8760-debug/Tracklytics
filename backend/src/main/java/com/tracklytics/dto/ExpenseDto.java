package com.tracklytics.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/dto/ExpenseDto.java
 * ============================================================================
 */
@Data
public class ExpenseDto {
    private Long id;
    private String title;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String paymentMethod;
    private String notes;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private String categoryIcon;
    private LocalDateTime createdAt;
}
