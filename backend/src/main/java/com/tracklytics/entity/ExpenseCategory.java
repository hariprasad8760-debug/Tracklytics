package com.tracklytics.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/entity/ExpenseCategory.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Expense transactions require categorization for analytical charts and budget filtering.
 *
 * WHAT THIS FILE DOES:
 *   Maps to `expense_categories` table in MySQL.
 * ============================================================================
 */
@Entity
@Table(name = "expense_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseCategory extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "color_code")
    private String colorCode; // Hex color for UI charts e.g. #8b5cf6

    @Column(name = "icon_name")
    private String iconName; // Icon identifier e.g. "code", "book", "coffee"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
