/**
 * ============================================================================
 * FILE: src/routes/AppRoutes.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Centralizing route declarations in `src/routes/AppRoutes.jsx` separates URL 
 *   mapping from component rendering. It keeps `App.jsx` clean and handles 
 *   nested layouts smoothly.
 *
 * WHAT THIS FILE DOES:
 *   1. Configures `<Routes>` mapped under the `<MainLayout>` layout wrapper.
 *   2. Connects path URLs (`/`, `/expense`, `/study`, etc.) to respective page components.
 *   3. Includes fallback route (`*`) redirecting invalid URLs back to Dashboard.
 *
 * FOLDER RESPONSIBILITY (src/routes/):
 *   Houses router logic, public routes, and future protected route wrappers.
 * ============================================================================
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ExpensePage from '../pages/expense/ExpensePage';
import StudyPage from '../pages/study/StudyPage';
import AnalyticsPage from '../pages/analytics/AnalyticsPage';
import CalendarPage from '../pages/calendar/CalendarPage';
import ReportsPage from '../pages/reports/ReportsPage';
import AuthPage from '../pages/auth/AuthPage';
import SettingsPage from '../pages/settings/SettingsPage';
import ProfilePage from '../pages/profile/ProfilePage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Primary App Frame with Sidebar and Header */}
      <Route path="/" element={<MainLayout />}>
        {/* Index Page: Overview Dashboard */}
        <Route index element={<DashboardPage />} />

        {/* Phase Pages */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="expense" element={<ExpensePage />} />
        <Route path="study" element={<StudyPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Fallback Catch-All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
