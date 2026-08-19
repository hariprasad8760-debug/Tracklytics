/**
 * ============================================================================
 * FILE: src/components/layout/Header.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   The top header bar provides context for the current screen, global search, 
 *   quick action buttons, user profile pill, and mobile sidebar hamburger menu.
 *
 * WHAT THIS FILE DOES:
 *   1. Displays current section title.
 *   2. Provides a stylized glass search input box with `⌘K` shortcut pill.
 *   3. Includes notification bell with unread indicator pulse dot.
 *   4. Displays user avatar pill with status indicator.
 *   5. Connects with `useSidebar` context for mobile drawer toggle.
 *
 * FOLDER RESPONSIBILITY (src/components/layout/):
 *   Houses top-level layout region components.
 * ============================================================================
 */

import React from 'react';
import { useSidebar } from '../../context/SidebarContext';
import { useVoice } from '../../context/VoiceContext';
import { FiMenu, FiSearch, FiBell, FiPlus, FiZap, FiMic } from 'react-icons/fi';
import GlassButton from '../common/GlassButton';

export const Header = ({ pageTitle = 'Dashboard' }) => {
  const { toggleMobile } = useSidebar();
  const { isVoiceModeActive, isListening, wakeWord, activateVoiceMode } = useVoice();

  return (
    <header className="sticky top-4 z-30 mb-6 w-full">
      <div className="water-glass-panel rounded-3xl px-5 py-3.5 flex items-center justify-between gap-4 shadow-xl border border-white/10">
        {/* LEFT SECTION: Mobile Hamburger + Page Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={toggleMobile}
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            aria-label="Toggle Navigation"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          {/* Current Page Title */}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {pageTitle}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <FiZap className="w-2.5 h-2.5 mr-1 text-purple-400" /> Live AI
              </span>
            </h1>
          </div>
        </div>

        {/* CENTER SECTION: Global Search Input (Hidden on mobile) */}
        <div className="hidden md:flex items-center relative max-w-md w-full">
          <FiSearch className="absolute left-3.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search expenses, study sessions, analytics..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-12 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 backdrop-blur-md transition-all"
          />
          <kbd className="absolute right-3 px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-white/10 rounded-lg border border-white/10">
            ⌘K
          </kbd>
        </div>

        {/* RIGHT SECTION: Quick Actions + Notifications + Profile Pill */}
        <div className="flex items-center gap-3">
          {/* Quick Add Button */}
          <GlassButton variant="primary" size="sm" icon={FiPlus} className="hidden sm:inline-flex">
            New Record
          </GlassButton>

          {/* Mic / Voice Activation Button */}
          <button
            onClick={activateVoiceMode}
            title={`Say "${wakeWord}" or click to activate voice mode`}
            className="relative p-2.5 rounded-2xl border transition-all duration-300"
            style={{
              background: isListening
                ? 'rgba(139,92,246,0.2)'
                : 'rgba(255,255,255,0.05)',
              borderColor: isListening
                ? 'rgba(139,92,246,0.5)'
                : 'rgba(255,255,255,0.1)',
              color: isListening ? '#c4b5fd' : '#94a3b8',
              boxShadow: isListening ? '0 0 16px rgba(139,92,246,0.25)' : 'none',
            }}
          >
            <FiMic className="w-4 h-4" />
            {isListening && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            )}
            {isListening && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-400" />
            )}
          </button>

          {/* Notification Bell */}
          <button className="relative p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors">
            <FiBell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="User Avatar"
                className="w-9 h-9 rounded-2xl object-cover border border-purple-500/40 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black" />
            </div>

            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">Hari Prasath</span>
              <span className="text-[10px] text-purple-400">Pro Student</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
