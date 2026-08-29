/**
 * ============================================================================
 * FILE: src/components/common/Badge.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Displaying trend percentage chips (+12.4%), status tags ("Active", "Completed"), 
 *   or count pill badges requires a uniform badge component with color variants.
 *
 * WHAT THIS FILE DOES:
 *   Renders a compact rounded pill chip with backdrop blur and custom theme colors:
 *     - `success` (green/cyan glow for positive trends)
 *     - `danger` (rose/red glow for negative metrics)
 *     - `purple` (violet glow for highlight tags)
 *     - `neutral` (subtle gray glass badge)
 *
 * FOLDER RESPONSIBILITY (src/components/common/):
 *   Houses reusable atomic design components.
 * ============================================================================
 */

import React from 'react';
import { clsx } from 'clsx';

/**
 * Badge Component
 * @param {React.ReactNode} children - Badge label or percentage text.
 * @param {'success' | 'danger' | 'purple' | 'neutral'} variant - Badge color theme.
 */
export const Badge = ({
  children,
  className = '',
  variant = 'neutral',
  icon: Icon,
}) => {
  const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-950/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-950/20',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/25 shadow-purple-950/20',
    neutral: 'bg-white/5 text-slate-300 border-white/10 shadow-black/20',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border backdrop-blur-md shadow-sm',
        variantStyles[variant],
        className
      )}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
};

export default Badge;
