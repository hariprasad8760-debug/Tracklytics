/**
 * ============================================================================
 * FILE: src/components/layout/Sidebar.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Replicates the exact narrow vertical pill capsule sidebar from the reference image:
 *     - Capsule shape with rounded-full edges
 *     - Top: 3D Luminous Sphere Orb Logo
 *     - Navigation icons: Grid, Expenses/File, Study/Users, Analytics, Calendar, Account
 * ============================================================================
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS, SECONDARY_NAV_ITEMS } from '../../constants/navigation';

export const Sidebar = () => {
  return (
    <aside className="h-[calc(100vh-4rem)] z-30 flex flex-col justify-between items-center py-5 px-3.5 glass-sidebar-capsule w-16 shrink-0 select-none">
      {/* TOP SECTION: 3D LUMINOUS SPHERE LOGO ORB */}
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="w-9 h-9 rounded-full luminous-orb-logo flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg cursor-pointer">
          <span className="sr-only">Tracklytics</span>
        </div>

        {/* NAVIGATION ICON LIST */}
        <nav className="flex flex-col gap-3.5 items-center w-full">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isCalendar = item.id === 'calendar';

            return (
              <NavLink
                key={item.id}
                to={item.path}
                title={item.label}
                className={({ isActive }) =>
                  `w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative ${
                    isActive
                      ? 'bg-white/20 text-white border border-white/25 shadow-md shadow-purple-950/50 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {isCalendar && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM SECTION: ACCOUNT / SETTINGS ICON */}
      <div className="flex flex-col gap-3 items-center w-full pt-3 border-t border-white/10">
        {SECONDARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                `w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white border border-white/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Icon className="w-4 h-4" />
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
