/**
 * ============================================================================
 * FILE: src/components/cards/StatCard.jsx
 * ============================================================================
 * Reusable water glass metric card matching reference design with click interactions:
 *   - Card 1: Study Hours (smooth wave sparkline curve)
 *   - Card 2: Expenses (EXACTLY 7 vertical bars representing 7 days, placed close together)
 *   - Card 3: Overall Month Review (3D donut pie slice)
 * ============================================================================
 */

import React from 'react';
import GlassCard from '../common/GlassCard';
import { FiTrendingUp, FiBarChart2, FiPieChart, FiActivity, FiChevronRight } from 'react-icons/fi';

/**
 * Sparkline 1: Smooth Area Wave Curve (Study Hours)
 */
const SparklineWave = () => (
  <svg className="w-full h-16 overflow-visible" viewBox="0 0 140 45" fill="none">
    <defs>
      <linearGradient id="waveGradSilver" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
      </linearGradient>
    </defs>
    <path
      d="M 0 36 Q 25 42 45 28 T 90 22 T 125 12 L 140 4 L 140 45 L 0 45 Z"
      fill="url(#waveGradSilver)"
    />
    <path
      d="M 0 36 Q 25 42 45 28 T 90 22 T 125 12 L 140 4"
      stroke="#ffffff"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Sparkline 2: EXACTLY 7 VERTICAL BARS representing 7 Days (Mon - Sun), placed closer together
 */
const SparklineBars7Days = () => (
  <div className="flex items-end justify-end h-14 w-full gap-1 px-1">
    {/* Mon (Day 1) */}
    <div className="w-2.5 bg-white/25 h-[45%] rounded-t-xs"></div>
    {/* Tue (Day 2 - HIGH EXPENSE: Bright Solid White Highlight) */}
    <div className="w-2.5 bg-white h-[98%] rounded-t-xs shadow-lg shadow-white/80"></div>
    {/* Wed (Day 3) */}
    <div className="w-2.5 bg-white/20 h-[30%] rounded-t-xs"></div>
    {/* Thu (Day 4) */}
    <div className="w-2.5 bg-white/35 h-[65%] rounded-t-xs"></div>
    {/* Fri (Day 5) */}
    <div className="w-2.5 bg-white/25 h-[35%] rounded-t-xs"></div>
    {/* Sat (Day 6 - LOW EXPENSE) */}
    <div className="w-2.5 bg-white/20 h-[20%] rounded-t-xs"></div>
    {/* Sun (Day 7) */}
    <div className="w-2.5 bg-white/25 h-[25%] rounded-t-xs"></div>
  </div>
);

/**
 * Sparkline 3: Donut / Pie Slice Graphic (Overall Month Review)
 */
const SparklineDonut = () => (
  <svg className="w-16 h-16 shrink-0" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="7" />
    <circle
      cx="20"
      cy="20"
      r="15"
      fill="none"
      stroke="#ffffff"
      strokeWidth="7"
      strokeDasharray="72 28"
      strokeDashoffset="8"
      strokeLinecap="round"
    />
  </svg>
);

export const StatCard = ({
  title,
  value,
  chartType = 'wave',
  onClick,
}) => {
  return (
    <GlassCard 
      onClick={onClick}
      className="flex flex-col justify-between h-full min-h-[180px] p-6 group hover:border-purple-400/60 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
    >
      {/* Top Header: Title + Icon */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-300 group-hover:text-purple-300 transition-colors flex items-center gap-1">
          {title} <FiChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>

        <div className="text-slate-300 group-hover:text-white transition-colors">
          {chartType === 'wave' && <FiTrendingUp className="w-4 h-4" />}
          {chartType === 'bars' && <FiBarChart2 className="w-4 h-4" />}
          {chartType === 'donut' && <FiPieChart className="w-4 h-4" />}
          {chartType === 'line' && <FiActivity className="w-4 h-4" />}
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="my-1">
        <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">
          {value}
        </h3>
      </div>

      {/* Bottom Vector Sparkline */}
      <div className="mt-2 pt-1 flex items-end justify-end">
        <div className="w-full shrink-0 flex justify-end items-end">
          {chartType === 'wave' && <SparklineWave />}
          {chartType === 'bars' && <SparklineBars7Days />}
          {chartType === 'donut' && <SparklineDonut />}
          {chartType === 'line' && <SparklineWave />}
        </div>
      </div>
    </GlassCard>
  );
};

export default StatCard;
