/**
 * ============================================================================
 * FILE: src/components/common/GlassButton.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Buttons across Tracklytics need consistent styling, active hover states, 
 *   loading spinners, and ripple glow effects. Encapsulating this logic in a 
 *   single component enforces design consistency.
 *
 * WHAT THIS FILE DOES:
 *   Renders a styled `<button>` element supporting 3 variants:
 *     1. `primary`: Vibrant electric blue / purple gradient button.
 *     2. `glass`: Translucent frosted glass button with subtle border glow.
 *     3. `ghost`: Minimalist transparent hover button.
 *
 * FOLDER RESPONSIBILITY (src/components/common/):
 *   Houses atomic UI components reusable throughout the application.
 * ============================================================================
 */

import React from 'react';
import { clsx } from 'clsx';

/**
 * GlassButton Component
 * @param {React.ReactNode} children - Button text or icon elements.
 * @param {'primary' | 'glass' | 'ghost'} variant - Visual style preset.
 * @param {'sm' | 'md' | 'lg'} size - Button size dimension.
 * @param {React.ComponentType} icon - Optional icon component to render.
 */
export const GlassButton = ({
  children,
  className = '',
  variant = 'glass',
  size = 'md',
  icon: Icon,
  disabled = false,
  ...props
}) => {
  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2 text-sm rounded-2xl gap-2',
    lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
  };

  // Visual variants
  const variantClasses = {
    primary:
      'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-medium shadow-lg shadow-purple-900/30 hover:shadow-purple-700/50 hover:opacity-95 active:scale-[0.98]',
    glass:
      'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-purple-500/40 backdrop-blur-md hover:shadow-md hover:shadow-purple-500/10 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white border border-transparent rounded-xl active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
};

export default GlassButton;
