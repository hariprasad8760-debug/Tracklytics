package com.tracklytics.controller;

import com.tracklytics.dto.ExpenseDto;
import com.tracklytics.entity.Expense;
import com.tracklytics.entity.ExpenseCategory;
import com.tracklytics.entity.User;
import com.tracklytics.repository.ExpenseCategoryRepository;
import com.tracklytics.repository.ExpenseRepository;
import com.tracklytics.repository.UserRepository;
import com.tracklytics.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/expenses")
@Tag(name = "Expense APIs", description = "Endpoints for managing MySQL Expenses")
@Transactional
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ExpenseController(ExpenseRepository expenseRepository,
                             ExpenseCategoryRepository categoryRepository,
                             UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "Get all expenses from MySQL database")
    public ResponseEntity<ApiResponse<List<ExpenseDto>>> getAllExpenses() {
        List<Expense> expenses = expenseRepository.findAll();
        List<ExpenseDto> dtos = expenses.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Expenses retrieved successfully from MySQL", dtos));
    }

    @PostMapping
    @Operation(summary = "Save new expense directly into MySQL database")
    public ResponseEntity<ApiResponse<ExpenseDto>> addExpense(@RequestBody Map<String, Object> payload) {
        User user = userRepository.findAll().stream().findFirst().orElseGet(() -> {
            User newUser = User.builder()
                    .fullName("Hari Prasath")
                    .email("hari@tracklytics.com")
                    .password("$2a$10$e8wYV9xJvN0x6bH1g0H8/.kZ5n3fQ2W8mXy1bZ5aK0L2mN3oP4q5r")
                    .role(com.tracklytics.entity.Role.ROLE_USER)
                    .enabled(true)
                    .build();
            return userRepository.save(newUser);
        });

        String title = (String) payload.getOrDefault("title", "Expense");
        Object amountObj = payload.get("amount");
        BigDecimal amount = BigDecimal.ZERO;
        if (amountObj != null) {
            amount = new BigDecimal(amountObj.toString());
        }

        String categoryName = (String) payload.getOrDefault("category", "General");
        ExpenseCategory category = categoryRepository.findByUserId(user.getId()).stream()
                .filter(c -> c.getName().equalsIgnoreCase(categoryName))
                .findFirst()
                .orElseGet(() -> {
                    ExpenseCategory cat = ExpenseCategory.builder()
                            .name(categoryName)
                            .user(user)
                            .colorCode("#8b5cf6")
                            .iconName("code")
                            .build();
                    return categoryRepository.save(cat);
                });

        LocalDate date = LocalDate.now();
        if (payload.containsKey("date") && payload.get("date") != null) {
            try {
                date = LocalDate.parse(payload.get("date").toString());
            } catch (Exception ignored) {}
        } else if (payload.containsKey("expenseDate") && payload.get("expenseDate") != null) {
            try {
                date = LocalDate.parse(payload.get("expenseDate").toString());
            } catch (Exception ignored) {}
        }

        String paymentMethod = (String) payload.getOrDefault("paymentMethod", "UPI / Contactless");
        String notes = (String) payload.getOrDefault("notes", "");

        Expense expense = Expense.builder()
                .title(title)
                .amount(amount)
                .expenseDate(date)
                .paymentMethod(paymentMethod)
                .notes(notes)
                .category(category)
                .user(user)
                .build();

        Expense saved = expenseRepository.save(expense);
        return ResponseEntity.ok(ApiResponse.success("Expense saved to MySQL", toDto(saved)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete expense by ID from MySQL database")
    public ResponseEntity<ApiResponse<String>> deleteExpense(@PathVariable Long id) {
        if (expenseRepository.existsById(id)) {
            expenseRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully from MySQL", "DELETED"));
        }
        return ResponseEntity.ok(ApiResponse.success("Expense not found or already deleted", "NOT_FOUND"));
    }

    private ExpenseDto toDto(Expense exp) {
        ExpenseDto dto = new ExpenseDto();
        dto.setId(exp.getId());
        dto.setTitle(exp.getTitle());
        dto.setAmount(exp.getAmount());
        dto.setExpenseDate(exp.getExpenseDate());
        dto.setPaymentMethod(exp.getPaymentMethod());
        dto.setNotes(exp.getNotes());
        dto.setCreatedAt(exp.getCreatedAt());
        if (exp.getCategory() != null) {
            dto.setCategoryId(exp.getCategory().getId());
            dto.setCategoryName(exp.getCategory().getName());
            dto.setCategoryColor(exp.getCategory().getColorCode());
            dto.setCategoryIcon(exp.getCategory().getIconName());
        } else {
            dto.setCategoryName("General");
            dto.setCategoryColor("#8b5cf6");
            dto.setCategoryIcon("dollar");
        }
        return dto;
    }
}
