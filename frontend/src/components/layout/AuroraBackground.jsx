/**
 * ============================================================================
 * FILE: src/components/layout/AuroraBackground.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   This component provides a dedicated, encapsulated, ultra-luxurious animated 
 *   Aurora background system inspired by modern FinTech and AI SaaS products 
 *   (Vercel, Linear, Framer, Raycast).
 *
 * WHAT THIS FILE DOES:
 *   1. Mounts a full-screen fixed container with deep black (#050816) to navy base gradient.
 *   2. Renders 4 independent, flowing Northern Lights wave ribbons using CSS keyframe 
 *      animations (Purple, Indigo, Electric Cyan, Rose Pink).
 *   3. Adds a subtle radial backlight centered behind dashboard cards.
 *   4. Includes a 2.5% SVG noise grain texture layer to prevent gradient color banding.
 *   5. Adds an edge vignette overlay for cinematic depth.
 *
 * COMPONENT COMPATIBILITY:
 *   This component is purely background-focused (`pointer-events: none`, `z-index: 0`).
 *   It does NOT modify sidebars, cards, headers, spacing, or typography in any way.
 * ============================================================================
 */

import React from 'react';
import '../../styles/AuroraBackground.css';

export const AuroraBackground = () => {
  return (
    <div className="aurora-canvas" aria-hidden="true">
      {/* Flowing Northern Lights Ribbon Layer 1: Purple & Indigo Wave */}
      <div className="aurora-wave aurora-wave-1" />

      {/* Flowing Northern Lights Ribbon Layer 2: Electric Cyan & Blue Wave */}
      <div className="aurora-wave aurora-wave-2" />

      {/* Flowing Northern Lights Ribbon Layer 3: Soft Magenta & Rose Highlight */}
      <div className="aurora-wave aurora-wave-3" />

      {/* Flowing Northern Lights Ribbon Layer 4: Deep Ambient Violet Wave */}
      <div className="aurora-wave aurora-wave-4" />

      {/* Subtle Radial Backlight behind Central Dashboard Content */}
      <div className="aurora-center-glow" />

      {/* Ultra-Light Film Grain / Noise Overlay (Eliminates Digital Banding) */}
      <div className="aurora-grain-texture" />

      {/* Edge Vignette Overlay for Depth */}
      <div className="aurora-edge-vignette" />
    </div>
  );
};

export default AuroraBackground;
