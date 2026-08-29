/**
 * ============================================================================
 * FILE: src/constants/navigation.js
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   In professional full-stack development, navigation routes, labels, and icons 
 *   should never be hardcoded across multiple UI files. Storing them in a central 
 *   constants file follows the DRY (Don't Repeat Yourself) principle.
 *
 * WHAT THIS FILE DOES:
 *   1. Exports an array of navigation item objects used by the Sidebar and Header.
 *   2. Maps each route to its icon, label, path, and optional badge count.
 *
 * FOLDER RESPONSIBILITY (src/constants/):
 *   Contains application-wide static constants, route definitions, configuration keys.
 * ============================================================================
 */

import { 
  FiGrid, 
  FiDollarSign, 
  FiBookOpen, 
  FiPieChart, 
  FiCalendar, 
  FiFileText, 
  FiUser, 
  FiSettings 
} from 'react-icons/fi';

/**
 * Main application navigation items.
 * Each object defines:
 *  - id: Unique key for rendering lists in React
 *  - label: Human-readable menu title
 *  - path: The URL path for React Router
 *  - icon: React-Icon component to render
 *  - badge: Optional tag chip to display next to menu item (e.g. "Live")
 */
export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: FiGrid,
  },
  {
    id: 'expense',
    label: 'Expenses',
    path: '/expense',
    icon: FiDollarSign,
    badge: '$4.2k',
  },
  {
    id: 'study',
    label: 'Study Tracker',
    path: '/study',
    icon: FiBookOpen,
    badge: '32h',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: FiPieChart,
  },
  {
    id: 'calendar',
    label: 'Calendar',
    path: '/calendar',
    icon: FiCalendar,
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: FiFileText,
  },
];

/**
 * Secondary navigation items for user profile and system settings.
 */
export const SECONDARY_NAV_ITEMS = [
  {
    id: 'auth',
    label: 'Account',
    path: '/auth',
    icon: FiUser,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: FiSettings,
  },
];
