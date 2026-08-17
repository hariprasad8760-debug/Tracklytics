package com.tracklytics.controller;

import com.tracklytics.dto.DashboardSummaryDto;
import com.tracklytics.response.ApiResponse;
import com.tracklytics.security.UserPrincipal;
import com.tracklytics.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller providing Dashboard overview analytics for React frontend.
 */
@RestController
@RequestMapping("/dashboard")
@Tag(name = "Dashboard APIs", description = "Endpoints for React Landing Dashboard Analytics")
@SecurityRequirement(name = "Bearer Authentication")
public class DashboardController {

    private final DashboardService dashboardService;

    // Constructor Injection
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get aggregated summary metrics for Dashboard cards")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getDashboardSummary(@AuthenticationPrincipal UserPrincipal currentUser) {
        DashboardSummaryDto summary = dashboardService.getDashboardSummary(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics retrieved successfully", summary));
    }
}
