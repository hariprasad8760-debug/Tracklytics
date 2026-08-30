/**
 * ============================================================================
 * FILE: src/components/layout/Header.jsx
 * ============================================================================
 * Top header bar with page title, global search, notification bell,
 * voice activation mic button, and interactive User Profile Hub.
 *
 * FEATURES:
 *   - Live AI status indicator.
 *   - Global Search with ⌘K pill.
 *   - Direct 1-click Mic button with real-time wake word listening badge.
 *   - Interactive User Profile Pill with floating glass Profile Hub dropdown.
 * ============================================================================
 */

import React, { useState } from 'react';
import { useSidebar } from '../../context/SidebarContext';
import { useVoice } from '../../context/VoiceContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { ProfileDropdown } from './ProfileDropdown';
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiPlus,
  FiZap,
  FiMic,
  FiMicOff,
  FiChevronDown,
  FiAward
} from 'react-icons/fi';
import GlassButton from '../common/GlassButton';

export const Header = ({ pageTitle = 'Dashboard' }) => {
  const { toggleMobile } = useSidebar();
  const { profile, statusOptions } = useUserProfile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const {
    isVoiceModeActive,
    isListening,
    conversationState,
    wakeWord,
    micPermission,
    activateDirectly,
    deactivateVoiceMode,
  } = useVoice();

  const isSpeaking = conversationState === 'ASSISTANT_RESPONDING';
  const isProcessing = conversationState === 'PROCESSING';
  const isActive = isListening || isSpeaking || isProcessing;

  const currentStatus = statusOptions.find((s) => s.id === profile.status) || statusOptions[0];

  const handleMicClick = () => {
    if (isVoiceModeActive) {
      deactivateVoiceMode();
    } else {
      activateDirectly();
    }
  };

  const micLabel = isVoiceModeActive
    ? 'Click to end voice session'
    : `Click to activate voice · or say "${wakeWord}"`;

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

          {/* ─── Mic / Voice Activation Button ─── */}
          <button
            onClick={handleMicClick}
            title={micLabel}
            className="relative p-2.5 rounded-2xl border transition-all duration-300 cursor-pointer"
            style={{
              background: isActive
                ? 'rgba(139,92,246,0.2)'
                : isVoiceModeActive
                  ? 'rgba(139,92,246,0.1)'
                  : 'rgba(255,255,255,0.05)',
              borderColor: isActive
                ? 'rgba(139,92,246,0.6)'
                : isVoiceModeActive
                  ? 'rgba(139,92,246,0.35)'
                  : 'rgba(255,255,255,0.1)',
              color: isActive ? '#c4b5fd' : isVoiceModeActive ? '#a78bfa' : '#94a3b8',
              boxShadow: isActive ? '0 0 18px rgba(139,92,246,0.35)' : 'none',
            }}
          >
            {micPermission === 'denied' ? (
              <FiMicOff className="w-4 h-4 text-red-400" />
            ) : (
              <FiMic className="w-4 h-4" />
            )}

            {/* Pulsing ring when actively listening / speaking */}
            {isActive && (
              <span className="absolute inset-0 rounded-2xl border border-purple-400/50 animate-ping pointer-events-none" />
            )}

            {/* Green dot: background watcher is running (IDLE state) */}
            {!isVoiceModeActive && micPermission === 'granted' && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 border border-black/40"
                title="Wake word listening"
              />
            )}

            {/* Purple dot: voice mode active but not yet speaking */}
            {isVoiceModeActive && !isActive && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-400" />
            )}
          </button>

          {/* Wake word hint pill */}
          {!isVoiceModeActive && micPermission === 'granted' && (
            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
              <FiMic className="w-2.5 h-2.5 text-emerald-400" />
              Say «{wakeWord}»
            </span>
          )}

          {/* Mic denied warning */}
          {micPermission === 'denied' && (
            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full">
              <FiMicOff className="w-2.5 h-2.5" /> Mic blocked
            </span>
          )}

          {/* Notification Bell */}
          <button className="relative p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors">
            <FiBell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500" />
          </button>

          {/* ─── Interactive User Profile Pill & Dropdown Hub ─── */}
          <div className="relative pl-2 border-l border-white/10">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 transition-all duration-200 cursor-pointer text-left group"
              title="Open User Profile & Hub"
              aria-expanded={isProfileOpen}
            >
              {/* Avatar with Status Dot */}
              <div className="relative shrink-0">
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-8 h-8 rounded-xl object-cover border border-purple-500/40 shadow-sm group-hover:scale-105 transition-transform"
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 shadow-xs"
                  style={{ backgroundColor: currentStatus.color }}
                />
              </div>

              {/* Name & Level Badge */}
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight group-hover:text-purple-300 transition-colors truncate max-w-[110px]">
                  {profile.fullName}
                </span>
                <span className="text-[10px] text-purple-400 font-medium flex items-center gap-1">
                  <FiAward className="w-2.5 h-2.5" /> Lv.{profile.level}
                </span>
              </div>

              <FiChevronDown
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${
                  isProfileOpen ? 'rotate-180 text-purple-400' : ''
                }`}
              />
            </button>

            {/* Floating Dropdown Modal */}
            <ProfileDropdown isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
