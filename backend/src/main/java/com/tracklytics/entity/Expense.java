package com.tracklytics.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/entity/Expense.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Represents individual expense transactions recorded by users.
 *
 * WHAT THIS FILE DOES:
 *   Maps to `expenses` table in MySQL database.
 * ============================================================================
 */
@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense extends BaseEntity {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "payment_method")
    private String paymentMethod; // Credit Card, UPI, Cash, Bank Transfer

    @Column(name = "notes", length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ExpenseCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
