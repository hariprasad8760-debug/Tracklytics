package com.tracklytics.service;

import com.tracklytics.dto.DashboardSummaryDto;

/**
 * Service interface for aggregating Dashboard metrics.
 */
public interface DashboardService {
    DashboardSummaryDto getDashboardSummary(Long userId);
}
