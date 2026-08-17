package com.tracklytics.repository;

import com.tracklytics.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/repository/UserRepository.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Spring Data JPA handles SQL queries for the `users` table automatically.
 *
 * WHAT THIS FILE DOES:
 *   Extends `JpaRepository<User, Long>` to provide CRUD and custom lookup queries.
 * ============================================================================
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);
}
