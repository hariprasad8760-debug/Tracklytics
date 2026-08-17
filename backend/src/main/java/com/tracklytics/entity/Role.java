package com.tracklytics.entity;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/entity/Role.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Defines user authorization roles for Role-Based Access Control (RBAC).
 *
 * WHAT THIS FILE DOES:
 *   1. `ROLE_USER`: Regular user access to personal expenses and study sessions.
 *   2. `ROLE_ADMIN`: Administrative privileges across system metrics.
 * ============================================================================
 */
public enum Role {
    ROLE_USER,
    ROLE_ADMIN
}
