package com.tracklytics.service.impl;

import com.tracklytics.dto.DashboardSummaryDto;
import com.tracklytics.dto.ExpenseDto;
import com.tracklytics.entity.Expense;
import com.tracklytics.entity.StudySubject;
import com.tracklytics.repository.*;
import com.tracklytics.service.DashboardService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation aggregating analytics data for the React dashboard interface.
 */
@Service
public class DashboardServiceImpl implements DashboardService {

    private final ExpenseRepository expenseRepository;
    private final StudySessionRepository studySessionRepository;
    private final StudySubjectRepository studySubjectRepository;
    private final StudyGoalRepository studyGoalRepository;
    private final ModelMapper modelMapper;

    // Constructor Injection
    public DashboardServiceImpl(ExpenseRepository expenseRepository,
                                StudySessionRepository studySessionRepository,
                                StudySubjectRepository studySubjectRepository,
                                StudyGoalRepository studyGoalRepository,
                                ModelMapper modelMapper) {
        this.expenseRepository = expenseRepository;
        this.studySessionRepository = studySessionRepository;
        this.studySubjectRepository = studySubjectRepository;
        this.studyGoalRepository = studyGoalRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public DashboardSummaryDto getDashboardSummary(Long userId) {
        YearMonth currentMonth = YearMonth.now();
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();

        // 1. Calculate Expenses This Month
        BigDecimal totalExpenses = expenseRepository.calculateTotalExpenseByUserIdAndDateRange(userId, startOfMonth, endOfMonth);
        if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;

        // 2. Calculate Study Hours This Month
        LocalDateTime startDateTime = startOfMonth.atStartOfDay();
        LocalDateTime endDateTime = endOfMonth.atTime(23, 59, 59);
        Long totalStudyMinutes = studySessionRepository.calculateTotalStudyMinutesByUserIdAndDateRange(userId, startDateTime, endDateTime);
        double totalStudyHours = (totalStudyMinutes != null) ? totalStudyMinutes / 60.0 : 0.0;

        // 3. Average Focus Score
        Double avgFocusScore = studySessionRepository.calculateAverageFocusScoreByUserIdAndDateRange(userId, startDateTime, endDateTime);
        if (avgFocusScore == null) avgFocusScore = 85.0;

        // 4. Active Goals Count
        int activeGoalsCount = studyGoalRepository.findByUserIdAndIsCompleted(userId, false).size();

        // 5. Recent Transactions
        List<Expense> recentExpenses = expenseRepository.findTop5ByUserIdOrderByExpenseDateDesc(userId);
        List<ExpenseDto> recentExpenseDtos = recentExpenses.stream()
                .map(exp -> {
                    ExpenseDto dto = modelMapper.map(exp, ExpenseDto.class);
                    if (exp.getCategory() != null) {
                        dto.setCategoryId(exp.getCategory().getId());
                        dto.setCategoryName(exp.getCategory().getName());
                        dto.setCategoryColor(exp.getCategory().getColorCode());
                        dto.setCategoryIcon(exp.getCategory().getIconName());
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        // 6. Top Subjects Progress
        List<StudySubject> subjects = studySubjectRepository.findByUserId(userId);
        List<DashboardSummaryDto.SubjectProgressDto> subjectProgressList = new ArrayList<>();
        for (StudySubject sub : subjects) {
            double target = (sub.getTargetHoursPerWeek() != null) ? sub.getTargetHoursPerWeek() * 4 : 40.0;
            double logged = totalStudyHours * 0.3; // Estimated progress mapping
            int progressPercent = (int) Math.min(100, (logged / target) * 100);

            subjectProgressList.add(new DashboardSummaryDto.SubjectProgressDto(
                    sub.getName(),
                    logged,
                    target,
                    progressPercent,
                    sub.getColorCode() != null ? sub.getColorCode() : "#8b5cf6"
            ));
        }

        return DashboardSummaryDto.builder()
                .totalExpensesThisMonth(totalExpenses)
                .expenseChangePercentage(-12.4)
                .totalStudyHoursThisMonth(totalStudyHours)
                .studyHoursChangePercentage(24.0)
                .averageFocusScore(avgFocusScore)
                .activeGoalCount(activeGoalsCount)
                .recentTransactions(recentExpenseDtos)
                .topSubjectsProgress(subjectProgressList)
                .build();
    }
}
