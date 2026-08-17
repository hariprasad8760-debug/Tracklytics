package com.tracklytics.repository;

import com.tracklytics.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/repository/NotificationRepository.java
 * ============================================================================
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    Long countByUserIdAndIsReadFalse(Long userId);
}
