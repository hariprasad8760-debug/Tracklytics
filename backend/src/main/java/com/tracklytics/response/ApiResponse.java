package com.tracklytics.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ============================================================================
 * FILE: src/main/java/com/tracklytics/response/ApiResponse.java
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   In production REST API design, every API endpoint should return a uniform, 
 *   consistent JSON response structure rather than raw unformatted objects. 
 *   This makes frontend integration (Axios in React) clean and error handling predictable.
 *
 * WHAT THIS FILE DOES:
 *   Defines a generic response envelope containing:
 *     - `success` (boolean): `true` for 2xx HTTP success, `false` for error responses.
 *     - `message` (String): Human-readable status message (e.g. "Expense created successfully").
 *     - `data` (T): Generic payload object holding DTOs, lists, or statistics.
 *     - `timestamp` (LocalDateTime): Exact server timestamp when response was generated.
 *
 * LOMBOK ANNOTATIONS EXPLAINED:
 *   - `@Data`: Automatically generates getters, setters, equals(), hashCode(), and toString().
 *   - `@Builder`: Provides Builder Pattern syntax (`ApiResponse.<UserDto>builder().data(...).build()`).
 *   - `@NoArgsConstructor`: Generates a default zero-argument constructor required by JSON deserializers.
 *   - `@AllArgsConstructor`: Generates a constructor accepting all fields.
 * ============================================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * Helper static factory method for successful responses with data.
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Helper static factory method for successful responses without payload data.
     */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Helper static factory method for error responses.
     */
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
