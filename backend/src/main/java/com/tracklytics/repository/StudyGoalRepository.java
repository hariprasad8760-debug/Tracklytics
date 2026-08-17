package com.tracklytics.repository;

import com.tracklytics.entity.StudyGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/repository/StudyGoalRepository.java
 * ============================================================================
 */
@Repository
public interface StudyGoalRepository extends JpaRepository<StudyGoal, Long> {

    List<StudyGoal> findByUserId(Long userId);

    List<StudyGoal> findByUserIdAndIsCompleted(Long userId, Boolean isCompleted);
}
