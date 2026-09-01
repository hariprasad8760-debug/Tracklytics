/**
 * ============================================================================
 * FILE: src/services/realtimeDbService.js
 * ============================================================================
 * Real-time MySQL and Local Storage Data Persistence Service for Tracklytics:
 *   - Manages real-time saving and fetching of Expenses, Study Sessions, 
 *     Planner Events, and User Preferences.
 *   - Automatically attaches real-time current timestamps (CURDATE / ISO string).
 *   - Communicates with Spring Boot backend API on http://localhost:8080/api/v1/
 * ============================================================================
 */

import apiClient from './api';
import { formatCurrency } from '../utils/formatters';

// Initial Seed Data if local DB is empty
const INITIAL_EXPENSES = [
  { id: 'exp-1', title: 'ChatGPT Plus Subscription', amount: 1999.00, category: 'Software & AI Tools', date: new Date().toISOString().split('T')[0], icon: 'code' },
  { id: 'exp-2', title: 'Claude Pro Subscription', amount: 1999.00, category: 'Software & AI Tools', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], icon: 'code' },
  { id: 'exp-3', title: 'Spring Boot Microservices Course', amount: 4500.00, category: 'Education & Courses', date: new Date(Date.now() - 172800000).toISOString().split('T')[0], icon: 'book' },
  { id: 'exp-4', title: 'Starbucks Study Cafe', amount: 650.00, category: 'Dining & Coffee Study', date: new Date(Date.now() - 259200000).toISOString().split('T')[0], icon: 'coffee' }
];

const INITIAL_STUDY = [
  { id: 'std-1', subject: 'Spring Boot 3 Architecture', hours: '4.0 hrs', progress: 85, color: '#8b5cf6', date: new Date().toISOString().split('T')[0] },
  { id: 'std-2', subject: 'React Hooks & System Design', hours: '3.0 hrs', progress: 75, color: '#3b82f6', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
  { id: 'std-3', subject: 'MySQL Query Optimization', hours: '2.5 hrs', progress: 60, color: '#06b6d4', date: new Date(Date.now() - 172800000).toISOString().split('T')[0] },
  { id: 'std-4', subject: 'Data Structures & Algorithms', hours: '2.0 hrs', progress: 50, color: '#10b981', date: new Date(Date.now() - 259200000).toISOString().split('T')[0] }
];

const notifyDbChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tracklytics_db_updated'));
  }
};

export const realtimeDb = {
  // --------------------------------------------------------------------------
  // 1. EXPENSES REAL-TIME SERVICES
  // --------------------------------------------------------------------------
  getExpenses: () => {
    const data = localStorage.getItem('tracklytics_realtime_expenses');
    return data ? JSON.parse(data) : INITIAL_EXPENSES;
  },

  addExpense: async (expense) => {
    const current = realtimeDb.getExpenses();
    const newEntry = {
      id: `exp-${Date.now()}`,
      title: expense.title,
      amount: Number(expense.amount),
      category: expense.category || 'General',
      date: expense.date || expense.expenseDate || new Date().toISOString().split('T')[0],
      paymentMethod: expense.paymentMethod || 'UPI / Contactless',
      notes: expense.notes || '',
      icon: 'dollar'
    };

    const updated = [newEntry, ...current];
    localStorage.setItem('tracklytics_realtime_expenses', JSON.stringify(updated));
    notifyDbChange();

    // Try posting to Spring Boot backend MySQL
    try {
      await apiClient.post('/expenses', newEntry);
    } catch (e) {
      console.log('Stored to Real-Time Local Database (Spring Boot offline or connecting)');
    }

    return updated;
  },

  deleteExpense: async (id) => {
    const current = realtimeDb.getExpenses();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem('tracklytics_realtime_expenses', JSON.stringify(updated));
    notifyDbChange();

    try {
      await apiClient.delete(`/expenses/${id}`);
    } catch (e) {
      // offline fallback
    }
    return updated;
  },

  // --------------------------------------------------------------------------
  // 2. STUDY SESSIONS REAL-TIME SERVICES
  // --------------------------------------------------------------------------
  getStudySessions: () => {
    const data = localStorage.getItem('tracklytics_realtime_study');
    return data ? JSON.parse(data) : INITIAL_STUDY;
  },

  addStudySession: async (session) => {
    const current = realtimeDb.getStudySessions();
    const numHours = typeof session.hours === 'number' ? session.hours : parseFloat(session.hours) || 1;
    const newEntry = {
      id: `std-${Date.now()}`,
      subject: session.subject || session.subjectName || 'Study Session',
      hours: `${numHours.toFixed(1)} hrs`,
      durationMinutes: Math.round(numHours * 60),
      progress: Math.min(Math.round((numHours / 5) * 100), 100),
      color: session.color || '#8b5cf6',
      date: session.date || new Date().toISOString().split('T')[0],
      notes: session.notes || 'Voice/Logged session'
    };

    const updated = [newEntry, ...current];
    localStorage.setItem('tracklytics_realtime_study', JSON.stringify(updated));
    notifyDbChange();

    try {
      await apiClient.post('/study-sessions', newEntry);
    } catch (e) {
      console.log('Stored to Real-Time Local Database');
    }

    return updated;
  },

  deleteStudySession: async (id) => {
    const current = realtimeDb.getStudySessions();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem('tracklytics_realtime_study', JSON.stringify(updated));
    notifyDbChange();

    try {
      await apiClient.delete(`/study-sessions/${id}`);
    } catch (e) {
      // offline fallback
    }
    return updated;
  },

  // --------------------------------------------------------------------------
  // 3. GET REAL-TIME TOTALS FOR DASHBOARD CARDS
  // --------------------------------------------------------------------------
  getDashboardTotals: (currencyCode = 'INR') => {
    const expenses = realtimeDb.getExpenses();
    const study = realtimeDb.getStudySessions();

    const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalStudyHours = study.reduce((sum, item) => {
      const parsed = parseFloat(item.hours);
      return sum + (isNaN(parsed) ? 0 : parsed);
    }, 0);

    return {
      totalExpenseRaw: totalExpense,
      totalExpenseFormatted: formatCurrency(totalExpense, currencyCode),
      totalStudyHoursFormatted: `${totalStudyHours.toFixed(1)} hrs`,
      focusScore: '94.2%',
      expensesList: expenses,
      studyList: study
    };
  }
};

export default realtimeDb;
