/**
 * ============================================================================
 * FILE: src/components/layout/MainLayout.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Replicates the exact layout structure from the reference image:
 *     - Background: Full screen animated Aurora background canvas
 *     - Left: Standalone vertical floating pill capsule sidebar
 *     - Right: Single large liquid glass main box container with 28px rounded corners.
 * ============================================================================
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import AuroraBackground from './AuroraBackground';
import Sidebar from './Sidebar';

export const MainLayout = () => {
  return (
    <div className="relative min-h-screen text-slate-100 flex p-4 md:p-8 gap-6 items-center justify-center overflow-x-hidden">
      {/* 1. Ambient Aurora Background Layer */}
      <AuroraBackground />

      {/* 2. Floating Glass Pill Sidebar Capsule */}
      <Sidebar />

      {/* 3. Main Liquid Glass Box Container */}
      <main className="glass-main-container flex-1 h-[calc(100vh-4rem)] p-8 md:p-12 relative overflow-y-auto z-10 flex flex-col justify-between">
        {/* Active Page View Rendered via React Router */}
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
