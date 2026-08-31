/**
 * ============================================================================
 * FILE: src/pages/expense/ExpensePage.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Provides a fully functional, interactive Expense Management module where users 
 *   can view summary stat cards, filter transactions by category, search by title, 
 *   and log new expenses through a liquid glass modal dialog.
 * ============================================================================
 */

import React, { useState } from 'react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import Badge from '../../components/common/Badge';
import { 
  FiDollarSign, 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiTrash2, 
  FiCalendar, 
  FiTag, 
  FiCreditCard,
  FiX,
  FiTrendingUp,
  FiChevronDown,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';

export const ExpensePage = () => {
  // Initial Expense Transactions State
  const [expenses, setExpenses] = useState([
    {
      id: 'tx-1',
      title: 'ChatGPT Plus Subscription',
      amount: 1999.00,
      category: 'Software Subscriptions',
      expenseDate: '2026-07-26',
      paymentMethod: 'Credit Card',
      notes: 'AI coding assistance subscription',
      color: '#8b5cf6'
    },
    {
      id: 'tx-2',
      title: 'Claude Pro Plan',
      amount: 1999.00,
      category: 'Software Subscriptions',
      expenseDate: '2026-07-25',
      paymentMethod: 'Credit Card',
      notes: 'LLM reasoning model',
      color: '#8b5cf6'
    },
    {
      id: 'tx-3',
      title: 'Spring Boot 3 Masterclass Book',
      amount: 4500.00,
      category: 'Education / Books',
      expenseDate: '2026-07-24',
      paymentMethod: 'Debit Card',
      notes: 'Advanced Spring Security reference',
      color: '#3b82f6'
    },
    {
      id: 'tx-4',
      title: 'Starbucks Study Cafe',
      amount: 650.00,
      category: 'Dining & Coffee',
      expenseDate: '2026-07-23',
      paymentMethod: 'UPI / Contactless',
      notes: 'Late night study coffee',
      color: '#f59e0b'
    },
    {
      id: 'tx-5',
      title: 'Udemy React Architecture Course',
      amount: 2499.00,
      category: 'Education / Books',
      expenseDate: '2026-07-20',
      paymentMethod: 'Credit Card',
      notes: 'Clean code & Hooks design',
      color: '#3b82f6'
    }
  ]);

  // Active Category Filter state
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Sort state: field and direction
  const [sortBy, setSortBy] = useState('date');       // 'date' | 'amount' | 'title'
  const [sortDir, setSortDir] = useState('desc');     // 'asc' | 'desc'
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Add Expense Modal open state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Expense Form State
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'Software Subscriptions',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Credit Card',
    notes: ''
  });

  // Calculate Metrics dynamically from state
  const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const averageExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;

  // Filter + Sort transactions
  const filteredExpenses = expenses
    .filter(expense => {
      const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory;
      const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            expense.notes.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date')   cmp = a.expenseDate.localeCompare(b.expenseDate);
      if (sortBy === 'amount') cmp = a.amount - b.amount;
      if (sortBy === 'title')  cmp = a.title.localeCompare(b.title);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  // Handle Form Submit
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;

    const createdItem = {
      id: `tx-${Date.now()}`,
      title: newExpense.title,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      expenseDate: newExpense.expenseDate,
      paymentMethod: newExpense.paymentMethod,
      notes: newExpense.notes || 'N/A',
      color: newExpense.category === 'Software Subscriptions' ? '#8b5cf6' : 
             newExpense.category === 'Education / Books' ? '#3b82f6' : '#f59e0b'
    };

    setExpenses([createdItem, ...expenses]);
    setNewExpense({
      title: '',
      amount: '',
      category: 'Software Subscriptions',
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Credit Card',
      notes: ''
    });
    setIsModalOpen(false);
  };

  // Handle Delete Item
  const handleDelete = (id) => {
    setExpenses(expenses.filter(item => item.id !== id));
  };

  const categories = ['All', 'Software Subscriptions', 'Education / Books', 'Dining & Coffee'];

  return (
    <div className="space-y-8 relative">
      {/* ---------------------------------------------------------------------- */}
      {/* 1. HEADER SECTION & METRICS CARDS                                      */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Expense Tracker</h2>
          <p className="text-xs text-slate-400 mt-1">Manage subscriptions, books, dining, and educational expenses</p>
        </div>

        <GlassButton 
          variant="primary" 
          icon={FiPlus}
          onClick={() => setIsModalOpen(true)}
        >
          Add Expense
        </GlassButton>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <GlassCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Spent</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <FiDollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-mono">{formatCurrency(totalSpent)}</h3>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <FiTrendingUp /> -12.4% vs last month budget
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Transactions</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FiTag className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-mono">{expenses.length} Records</h3>
          <p className="text-[11px] text-slate-400 mt-1">Across 3 active categories</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Average Expense</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FiCreditCard className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-mono">{formatCurrency(averageExpense)}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Per transaction average</p>
        </GlassCard>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. SEARCH BAR                                                           */}
      {/* ---------------------------------------------------------------------- */}
      <GlassCard className="p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </GlassCard>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. TRANSACTIONS LIST & TABLE                                           */}
      {/* ---------------------------------------------------------------------- */}
      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Expense Records ({filteredExpenses.length})</h3>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No expense records found matching your filters.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  {/* Category Color Dot Badge */}
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10"
                    style={{ backgroundColor: `${exp.color}15`, color: exp.color }}
                  >
                    <FiDollarSign className="w-5 h-5" />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {exp.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 text-purple-400" /> {exp.expenseDate}
                      </span>
                      <span>•</span>
                      <span>{exp.paymentMethod}</span>
                      <span>•</span>
                      <span className="text-slate-300">{exp.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-base font-extrabold font-mono text-white">
                    -{formatCurrency(exp.amount)}
                  </span>
                  
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete record"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* ---------------------------------------------------------------------- */}
      {/* 4. INTERACTIVE ADD EXPENSE MODAL DIALOG                                 */}
      {/* ---------------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="water-glass-panel w-full max-w-lg rounded-3xl p-6 border border-white/15 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FiPlus className="text-purple-400" /> Add New Expense
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/10"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ChatGPT Plus / Textbooks"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="20.00"
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
                    <option value="Software Subscriptions">Software Subscriptions</option>
                    <option value="Education / Books">Education / Books</option>
                    <option value="Dining & Coffee">Dining & Coffee</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newExpense.expenseDate}
                    onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={newExpense.paymentMethod}
                    onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="UPI / Contactless">UPI / Contactless</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Description</label>
                <input
                  type="text"
                  placeholder="Optional details..."
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <GlassButton type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </GlassButton>
                <GlassButton type="submit" variant="primary">
                  Save Transaction
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensePage;
