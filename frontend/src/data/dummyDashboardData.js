/**
 * ============================================================================
 * FILE: src/data/dummyDashboardData.js
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   During Phase 1 through Phase 7, the application operates in frontend-first mode 
 *   using structured mock data before connecting to the Spring Boot backend in Phase 9.
 *
 * WHAT THIS FILE DOES:
 *   Provides mock analytics, transaction logs, study session records, and summary cards.
 *
 * FOLDER RESPONSIBILITY (src/data/):
 *   Stores initial mock datasets, fixtures, and local fallback data structures.
 * ============================================================================
 */

export const SUMMARY_METRICS = [
  {
    id: 'monthly-growth',
    title: 'Monthly Expenses',
    value: '$4,520',
    change: '-12.4%',
    isPositive: true, // Decreasing expenses is positive for savings
    period: 'vs last month',
    chartType: 'wave',
    accentColor: 'purple',
  },
  {
    id: 'study-hours',
    title: 'Study Hours',
    value: '128.5 hrs',
    change: '+24%',
    isPositive: true,
    period: 'vs target goal',
    chartType: 'bars',
    accentColor: 'cyan',
  },
  {
    id: 'focus-score',
    title: 'Focus Score',
    value: '94.2%',
    change: '+5.8%',
    isPositive: true,
    period: 'top 5% learners',
    chartType: 'donut',
    accentColor: 'blue',
  },
  {
    id: 'active-sessions',
    title: 'Active Sessions',
    value: '31 sessions',
    change: '+8 this week',
    isPositive: true,
    period: 'across 4 subjects',
    chartType: 'line',
    accentColor: 'pink',
  },
];

export const RECENT_TRANSACTIONS = [
  {
    id: 'tx-1',
    category: 'Software Subscription',
    title: 'ChatGPT Plus & Claude Pro',
    date: 'Today, 2:15 PM',
    amount: '-$40.00',
    status: 'Completed',
    icon: 'code',
  },
  {
    id: 'tx-2',
    category: 'Education / Books',
    title: 'Spring Boot 3 Deep Dive Course',
    date: 'Yesterday, 6:30 PM',
    amount: '-$89.99',
    status: 'Completed',
    icon: 'book',
  },
  {
    id: 'tx-3',
    category: 'Stipend / Income',
    title: 'Research Assistant Stipend',
    date: '24 Jul 2026',
    amount: '+$1,250.00',
    status: 'Received',
    icon: 'dollar',
  },
  {
    id: 'tx-4',
    category: 'Dining & Coffee',
    title: 'Starbucks Study Cafe',
    date: '23 Jul 2026',
    amount: '-$14.50',
    status: 'Completed',
    icon: 'coffee',
  },
];

export const TOP_SUBJECTS_PROGRESS = [
  {
    subject: 'Spring Boot Architecture',
    hours: '42.5 hrs',
    progress: 85,
    color: '#8b5cf6', // Violet
  },
  {
    subject: 'React & System Design',
    hours: '36.0 hrs',
    progress: 72,
    color: '#3b82f6', // Electric Blue
  },
  {
    subject: 'MySQL & Database Optimization',
    hours: '28.0 hrs',
    progress: 60,
    color: '#06b6d4', // Cyan
  },
  {
    subject: 'Data Structures & Algorithms',
    hours: '22.0 hrs',
    progress: 50,
    color: '#ec4899', // Pink Glow
  },
];
