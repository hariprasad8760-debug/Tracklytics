package com.tracklytics.repository;

import com.tracklytics.entity.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/repository/UserSettingsRepository.java
 * ============================================================================
 */
@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {

    Optional<UserSettings> findByUserId(Long userId);
}
