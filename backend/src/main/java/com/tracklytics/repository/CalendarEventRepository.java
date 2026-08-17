package com.tracklytics.repository;

import com.tracklytics.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/repository/CalendarEventRepository.java
 * ============================================================================
 */
@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    List<CalendarEvent> findByUserId(Long userId);

    List<CalendarEvent> findByUserIdAndStartTimeBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);
}
