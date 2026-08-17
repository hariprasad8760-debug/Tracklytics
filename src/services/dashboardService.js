/**
 * ============================================================================
 * FILE: src/services/dashboardService.js
 * ============================================================================
 * WHAT THIS FILE DOES:
 *   Contains API calls connecting React Dashboard components to Spring Boot 
 *   `/dashboard/summary` REST endpoints.
 * ============================================================================
 */

import apiClient from './api';

export const dashboardService = {
  /**
   * Fetches aggregated dashboard metrics from Spring Boot backend.
   */
  getSummary: async () => {
    return await apiClient.get('/dashboard/summary');
  },
};

export default dashboardService;
