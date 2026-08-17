package com.tracklytics.constants;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/constants/AppConstants.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Centralized constants repository for system-wide static values, default pagination 
 *   settings, security header names, and date format strings.
 *
 * WHAT THIS FILE DOES:
 *   Defines constant values used across Controllers, Services, and Security filters.
 * ============================================================================
 */
public class AppConstants {

    // Prevent instantiation of utility/constants class
    private AppConstants() {}

    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "desc";

    public static final String TOKEN_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";

    // User Roles
    public static final String ROLE_USER = "ROLE_USER";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
}
