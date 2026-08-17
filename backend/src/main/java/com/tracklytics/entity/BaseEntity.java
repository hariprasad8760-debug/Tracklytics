package com.tracklytics.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/entity/BaseEntity.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   In enterprise JPA entity design, almost every table requires tracking when a row 
 *   was created (`createdAt`) and when it was last updated (`updatedAt`). Instead of 
 *   duplicating these fields across 10 entity classes, we create an abstract `@MappedSuperclass`.
 *
 * WHAT THIS FILE DOES:
 *   1. `@MappedSuperclass`: Tells JPA that this class's properties should be inherited 
 *      by child entity subclasses into their respective MySQL tables.
 *   2. `@EntityListeners(AuditingEntityListener.class)`: Activates Spring Data JPA 
 *      auditing to automatically populate timestamp fields without manual setter calls.
 *   3. `@CreatedDate` & `@LastModifiedDate`: Populated automatically upon insert & update.
 * ============================================================================
 */
@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
