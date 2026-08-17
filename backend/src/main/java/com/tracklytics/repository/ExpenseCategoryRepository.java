package com.tracklytics.repository;

import com.tracklytics.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/repository/ExpenseCategoryRepository.java
 * ============================================================================
 */
@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {

    List<ExpenseCategory> findByUserId(Long userId);

    Optional<ExpenseCategory> findByIdAndUserId(Long id, Long userId);

    Boolean existsByNameAndUserId(String name, Long userId);
}
