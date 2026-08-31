/**
 * ============================================================================
 * FILE: src/pages/analytics/AnalyticsPage.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Provides an interactive Analytics Suite displaying expense vs study productivity 
 *   correlations, category distributions, and automated AI insights.
 * ============================================================================
 */

import React, { useState } from 'react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import Badge from '../../components/common/Badge';
import { 
  FiPieChart, 
  FiTrendingUp, 
  FiZap, 
  FiDollarSign, 
  FiBookOpen, 
  FiBarChart2,
  FiClock,
  FiCheck
} from 'react-icons/fi';

export const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('July 2026');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Advanced Analytics & AI Insights</h2>
          <p className="text-xs text-slate-400 mt-1">Cross-domain correlation between educational spend and study performance</p>
        </div>

        <div className="flex items-center gap-2">
          {['July 2026', 'Q2 2026', 'Year 2026'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                timeRange === range
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Top Stat Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <GlassCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Productivity ROI</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <FiZap className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-mono">3.21 hrs / ₹500</h3>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <FiTrendingUp /> +18.2% ROI efficiency rating
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Monthly Spend</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FiDollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-mono">₹18,450.00</h3>
          <p className="text-[11px] text-slate-400 mt-1">Within monthly budget limit</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Focus Time</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FiClock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-mono">128.5 hrs</h3>
          <p className="text-[11px] text-purple-300 mt-1">Top 5% overall learners</p>
        </GlassCard>
      </div>

      {/* Main Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Category Distribution (7 cols) */}
        <GlassCard className="lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiBarChart2 className="text-purple-400" /> Category Breakdown
              </h3>
              <p className="text-xs text-slate-400">Distribution of expenses by category</p>
            </div>
            <Badge variant="purple">Live Data</Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-200 font-semibold">Software & AI Tools</span>
                <span className="font-mono text-purple-300">₹7,500.00 (41%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '41%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-200 font-semibold">Education & Courses</span>
                <span className="font-mono text-blue-300">₹5,700.00 (31%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '31%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-200 font-semibold">Dining & Coffee Study</span>
                <span className="font-mono text-cyan-300">₹3,100.00 (17%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '17%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-200 font-semibold">General & Books</span>
                <span className="font-mono text-emerald-300">₹2,150.00 (11%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '11%' }} />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Right Column: AI Insights Widget (5 cols) */}
        <GlassCard className="lg:col-span-5 flex flex-col justify-between bg-purple-950/20 border-purple-500/30">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiZap className="text-amber-400 w-5 h-5 animate-pulse" />
              <h3 className="text-base font-bold text-white">Tracklytics AI Insights</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="font-bold text-purple-300 flex items-center gap-1.5">
                  <FiCheck className="text-emerald-400" /> High ROI Investment
                </span>
                <p className="text-slate-300">
                  Your ₹3,998 AI tool spend correlated with a <strong>24% increase</strong> in logged Spring Boot study hours this week.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <FiCheck className="text-emerald-400" /> Optimal Study Slot
                </span>
                <p className="text-slate-300">
                  Your focus score is highest (95%) during morning blocks (10:00 AM - 12:00 PM).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <GlassButton variant="primary" size="sm" className="w-full">
              Generate AI Weekly Report
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AnalyticsPage;
