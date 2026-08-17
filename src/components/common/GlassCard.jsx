/**
 * ============================================================================
 * FILE: src/components/common/GlassCard.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Reusability is the cornerstone of React architecture. Instead of rewriting 
 *   backdrop-blur, glass background, and border styling on every single card, 
 *   we create a reusable `GlassCard` wrapper component.
 *
 * WHAT THIS FILE DOES:
 *   Renders a container div with liquid water-glass aesthetics, rounded corners, 
 *   soft glow reflection, backdrop filter blur, and custom hover elevation.
 *
 * FOLDER RESPONSIBILITY (src/components/common/):
 *   Houses atomic, generic UI components (Buttons, Cards, Badges, Modals) that 
 *   are completely agnostic of specific domain logic.
 * ============================================================================
 */

import React from 'react';
import { clsx } from 'clsx';

/**
 * GlassCard Component
 * @param {React.ReactNode} children - Content inside the glass card.
 * @param {string} className - Optional custom Tailwind / CSS classes.
 * @param {boolean} hoverEffect - Whether to trigger glowing border and lift on hover.
 * @param {boolean} isPanel - If true, uses static panel styling without lift.
 */
export const GlassCard = ({
  children,
  className = '',
  hoverEffect = true,
  isPanel = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        // Base styling for water-glass frosted container
        isPanel ? 'water-glass-panel' : hoverEffect ? 'water-glass-card' : 'water-glass-panel',
        'p-6 relative overflow-hidden',
        className
      )}
      {...props}
    >
      {/* Light Reflection Highlight - Ambient top edge shine */}
      <div 
        className="pointer-events-none absolute -top-12 -left-12 w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl opacity-60" 
      />
      
      {/* Card Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GlassCard;
