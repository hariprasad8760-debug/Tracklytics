/**
 * ============================================================================
 * FILE: src/pages/dashboard/DashboardPage.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Home dashboard connected to Real-Time Data Storage (realtimeDb):
 *     - Displays real-time Study Hours, Expenses, and Overall Review totals.
 *     - Interactive "+ Add Expense" and "+ Add Study Session" modals with instant 
 *       real-time saving to database!
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import StatCard from '../../components/cards/StatCard';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import Badge from '../../components/common/Badge';
import { realtimeDb } from '../../services/realtimeDbService';
import { 
  FiClock, 
  FiBookOpen, 
  FiDollarSign, 
  FiCode, 
  FiCoffee,
  FiX,
  FiTrendingUp,
  FiTrendingDown,
  FiAward,
  FiPlus,
  FiCheckCircle
} from 'react-icons/fi';

export const DashboardPage = () => {
  // Real-Time Data State
  const [totals, setTotals] = useState(realtimeDb.getDashboardTotals());

  // Modal State: null | 'studyGraph' | 'expenseGraph' | 'overview' | 'addExpense' | 'addStudy'
  const [activeModal, setActiveModal] = useState(null);

  // Forms State
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: 'Software & AI Tools' });
  const [newStudy, setNewStudy] = useState({ subject: '', hours: '', color: '#8b5cf6' });

  // Success Notification Toast
  const [toastMessage, setToastMessage] = useState('');

  const refreshData = () => {
    setTotals(realtimeDb.getDashboardTotals());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Handle Add New Expense
  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;

    await realtimeDb.addExpense(newExpense);
    refreshData();
    setNewExpense({ title: '', amount: '', category: 'Software & AI Tools' });
    setActiveModal(null);

    setToastMessage('New Expense Saved to Real-Time Database!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Handle Add New Study Session
  const handleCreateStudy = async (e) => {
    e.preventDefault();
    if (!newStudy.subject || !newStudy.hours) return;

    await realtimeDb.addStudySession(newStudy);
    refreshData();
    setNewStudy({ subject: '', hours: '', color: '#8b5cf6' });
    setActiveModal(null);

    setToastMessage('New Study Session Saved to Real-Time Database!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  // 7-Day Graph Points
  const studyDays = [
    { day: 'Mon', hours: 6.0, x: 25, y: 55 },
    { day: 'Tue', hours: 8.5, x: 75, y: 15, isHigh: true },
    { day: 'Wed', hours: 5.5, x: 125, y: 60 },
    { day: 'Thu', hours: 7.0, x: 175, y: 35 },
    { day: 'Fri', hours: 6.5, x: 225, y: 45 },
    { day: 'Sat', hours: 4.0, x: 275, y: 80 },
    { day: 'Sun', hours: 1.5, x: 325, y: 115, isLow: true },
  ];

  const expenseDays = [
    { day: 'Mon', amount: 40, x: 25, y: 70 },
    { day: 'Tue', amount: 90, x: 75, y: 15, isHigh: true },
    { day: 'Wed', amount: 25, x: 125, y: 85 },
    { day: 'Thu', amount: 60, x: 175, y: 45 },
    { day: 'Fri', amount: 30, x: 225, y: 80 },
    { day: 'Sat', amount: 15, x: 275, y: 110, isLow: true },
    { day: 'Sun', amount: 20, x: 325, y: 95 },
  ];

  return (
    <div className="space-y-8 relative">
      {/* ---------------------------------------------------------------------- */}
      {/* HERO TITLE & LIVE TOAST NOTIFICATION                                   */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white font-sans">
            Monthly Growth
          </h2>
          <p className="text-sm font-normal text-slate-300/80 mt-2">
            Real-Time Analytics & Database Sync
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GlassButton variant="primary" size="sm" icon={FiPlus} onClick={() => setActiveModal('addExpense')}>
            + Add Expense
          </GlassButton>
          <GlassButton variant="glass" size="sm" icon={FiPlus} onClick={() => setActiveModal('addStudy')}>
            + Log Study
          </GlassButton>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xl animate-in fade-in">
          <FiCheckCircle className="w-5 h-5 text-emerald-400" /> {toastMessage}
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* REAL-TIME CARDS ROW                                                   */}
      {/* ---------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Study Hours"
          value={totals.totalStudyHoursFormatted}
          chartType="wave"
          onClick={() => setActiveModal('studyGraph')}
        />

        <StatCard
          title="Expenses"
          value={totals.totalExpenseFormatted}
          chartType="bars"
          onClick={() => setActiveModal('expenseGraph')}
        />

        <StatCard
          title="Overall Month Review"
          value={totals.focusScore}
          chartType="donut"
          onClick={() => setActiveModal('overview')}
        />
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* MAIN ANALYTICS GRID                                                   */}
      {/* ---------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* LEFT COLUMN: Study Tracker Subject Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiBookOpen className="text-purple-400" />
                  Study Hours Breakdown
                </h3>
                <p className="text-xs text-slate-400">Target vs Completed study time</p>
              </div>

              <GlassButton variant="ghost" size="sm" icon={FiPlus} onClick={() => setActiveModal('addStudy')}>
                + Log
              </GlassButton>
            </div>

            {/* Progress Bars List */}
            <div className="space-y-5 my-2">
              {totals.studyList.map((subject, index) => (
                <div key={subject.id || index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{subject.subject}</span>
                    <span className="font-mono text-purple-300 font-medium">{subject.hours}</span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-white/5 border border-white/10 overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        width: `${subject.progress}%`,
                        backgroundColor: subject.color || '#8b5cf6',
                        boxShadow: `0 0 12px ${subject.color || '#8b5cf6'}80`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <FiClock className="text-cyan-400" /> Total Real-Time: <strong className="text-white">{totals.totalStudyHoursFormatted}</strong>
              </span>
              <span 
                onClick={() => setActiveModal('studyGraph')}
                className="text-purple-400 font-semibold cursor-pointer hover:underline"
              >
                View Glow Line Graph →
              </span>
            </div>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: Recent Transactions Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiDollarSign className="text-emerald-400" />
                  Recent Activity
                </h3>
                <p className="text-xs text-slate-400">Real-Time Transactions</p>
              </div>

              <GlassButton variant="ghost" size="sm" icon={FiPlus} onClick={() => setActiveModal('addExpense')}>
                + Add
              </GlassButton>
            </div>

            {/* Transactions List */}
            <div className="space-y-3.5 my-2">
              {totals.expensesList.slice(0, 4).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                      <FiDollarSign className="w-4 h-4 text-emerald-400" />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white leading-tight">
                        {tx.title}
                      </span>
                      <span className="text-[11px] text-slate-400">{tx.date}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      ${Number(tx.amount).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500">{tx.category}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-center">
              <GlassButton variant="glass" size="sm" className="w-full" onClick={() => setActiveModal('addExpense')}>
                + Save New Expense to Real-Time DB
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* MODALS: ADD EXPENSE & ADD STUDY                                       */}
      {/* ---------------------------------------------------------------------- */}

      {/* ADD EXPENSE MODAL */}
      {activeModal === 'addExpense' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="water-glass-panel w-full max-w-md rounded-3xl p-6 border border-white/20 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FiDollarSign className="text-emerald-400" /> Add Real-Time Expense
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Cloud Infrastructure"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="49.99"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Software & AI Tools">Software & AI Tools</option>
                  <option value="Education & Courses">Education & Courses</option>
                  <option value="Dining & Coffee Study">Dining & Coffee Study</option>
                  <option value="General & Books">General & Books</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <GlassButton type="button" variant="ghost" onClick={() => setActiveModal(null)}>
                  Cancel
                </GlassButton>
                <GlassButton type="submit" variant="primary">
                  Save to Real-Time Database
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STUDY SESSION MODAL */}
      {activeModal === 'addStudy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="water-glass-panel w-full max-w-md rounded-3xl p-6 border border-white/20 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FiBookOpen className="text-purple-400" /> Log Real-Time Study Session
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spring Boot Security & JWT"
                  value={newStudy.subject}
                  onChange={(e) => setNewStudy({ ...newStudy, subject: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Study Hours</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="3.5"
                  value={newStudy.hours}
                  onChange={(e) => setNewStudy({ ...newStudy, hours: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <GlassButton type="button" variant="ghost" onClick={() => setActiveModal(null)}>
                  Cancel
                </GlassButton>
                <GlassButton type="submit" variant="primary">
                  Save Study Session
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRAPH POP-UPS FOR CARDS */}
      {activeModal === 'studyGraph' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="water-glass-panel w-full max-w-lg rounded-3xl p-6 border border-white/20 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiClock className="text-purple-400" /> Study Hours Glow Line Graph
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full h-48 bg-black/40 rounded-2xl border border-white/10 p-4 flex flex-col justify-between">
              <svg className="w-full h-32 overflow-visible" viewBox="0 0 350 130">
                <path d="M 25 55 Q 50 30 75 15 T 125 60 T 175 35 T 225 45 T 275 80 T 325 115" stroke="#ffffff" strokeWidth="3.5" fill="none" />
                {studyDays.map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="5" fill="#ffffff" />
                ))}
              </svg>
              <div className="flex justify-between px-2 pt-2 border-t border-white/10 text-xs font-bold text-slate-400">
                {studyDays.map((d, i) => <span key={i}>{d.day}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'expenseGraph' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="water-glass-panel w-full max-w-lg rounded-3xl p-6 border border-white/20 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiDollarSign className="text-emerald-400" /> Expense Glow Line Graph
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full h-48 bg-black/40 rounded-2xl border border-white/10 p-4 flex flex-col justify-between">
              <svg className="w-full h-32 overflow-visible" viewBox="0 0 350 130">
                <path d="M 25 70 Q 50 35 75 15 T 125 85 T 175 45 T 225 80 T 275 110 T 325 95" stroke="#ffffff" strokeWidth="3.5" fill="none" />
                {expenseDays.map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="5" fill="#ffffff" />
                ))}
              </svg>
              <div className="flex justify-between px-2 pt-2 border-t border-white/10 text-xs font-bold text-slate-400">
                {expenseDays.map((d, i) => <span key={i}>{d.day}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
