package com.tracklytics.repository;

import com.tracklytics.entity.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/repository/StudySessionRepository.java
 * ============================================================================
 */
@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    List<StudySession> findByUserIdOrderBySessionDateDesc(Long userId);

    List<StudySession> findByUserIdAndSessionDateBetweenOrderBySessionDateDesc(Long userId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT SUM(s.durationMinutes) FROM StudySession s WHERE s.user.id = :userId AND s.sessionDate BETWEEN :startDate AND :endDate")
    Long calculateTotalStudyMinutesByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(s.focusScore) FROM StudySession s WHERE s.user.id = :userId AND s.sessionDate BETWEEN :startDate AND :endDate")
    Double calculateAverageFocusScoreByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
