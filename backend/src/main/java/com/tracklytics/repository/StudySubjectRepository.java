package com.tracklytics.repository;

import com.tracklytics.entity.StudySubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/repository/StudySubjectRepository.java
 * ============================================================================
 */
@Repository
public interface StudySubjectRepository extends JpaRepository<StudySubject, Long> {

    List<StudySubject> findByUserId(Long userId);

    Optional<StudySubject> findByIdAndUserId(Long id, Long userId);
}
