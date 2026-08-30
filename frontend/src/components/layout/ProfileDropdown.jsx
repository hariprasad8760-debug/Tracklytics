/**
 * ============================================================================
 * FILE: src/components/layout/ProfileDropdown.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Interactive, floating Water-Glass Profile Hub rendered in the Header bar.
 *   Provides quick access to identity, status switching, XP progression, and links.
 * ============================================================================
 */

import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../../context/UserProfileContext';
import {
  FiUser,
  FiSettings,
  FiAward,
  FiSun,
  FiClock,
  FiDollarSign,
  FiMic,
  FiFileText,
  FiExternalLink,
  FiCheck,
  FiLogOut,
  FiZap,
  FiChevronRight
} from 'react-icons/fi';

export const ProfileDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { profile, updateStatus, statusOptions } = useUserProfile();

  const currentStatus = statusOptions.find((s) => s.id === profile.status) || statusOptions[0];
  const xpPercent = Math.min(100, Math.round((profile.currentXp / profile.nextLevelXp) * 100));

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-14 w-80 sm:w-96 rounded-3xl p-4 bg-slate-900/95 border border-purple-500/40 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-3 duration-200 text-white select-none"
    >
      {/* ── 1. USER IDENTITY HEADER ───────────────────────────────────────── */}
      <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10">
        <div className="relative">
          <img
            src={profile.avatarUrl}
            alt={profile.fullName}
            className="w-12 h-12 rounded-2xl object-cover border border-purple-500/40 shadow-md"
          />
          <span
            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900"
            style={{ backgroundColor: currentStatus.color }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white truncate">{profile.fullName}</h4>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Lv.{profile.level}
            </span>
          </div>
          <p className="text-xs text-purple-300/80 truncate font-mono">@{profile.username}</p>
          <p className="text-[11px] text-slate-400 truncate">{profile.title}</p>
        </div>
      </div>

      {/* ── 2. LEVEL & XP MINI PROGRESS BAR ───────────────────────────────── */}
      <div className="mt-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-300 flex items-center gap-1 font-medium">
            <FiZap className="text-yellow-400 w-3 h-3" /> {profile.levelTitle}
          </span>
          <span className="font-mono text-purple-300 text-[10px]">
            {profile.currentXp} / {profile.nextLevelXp} XP
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* ── 3. STATUS QUICK SELECTOR ───────────────────────────────────────── */}
      <div className="mt-3">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 block mb-1.5">
          Set Status
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {statusOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => updateStatus(opt.id)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                profile.status === opt.id
                  ? 'bg-purple-500/25 border border-purple-500/40 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-transparent'
              }`}
            >
              <span>{opt.emoji}</span>
              <span className="truncate">{opt.label}</span>
              {profile.status === opt.id && <FiCheck className="ml-auto text-purple-300 w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. PRODUCTIVITY MINI STATS ─────────────────────────────────────── */}
      <div className="mt-3.5 grid grid-cols-3 gap-2 text-center p-2 rounded-2xl bg-white/5 border border-white/10">
        <div className="p-1">
          <span className="block text-xs font-bold text-orange-400 flex items-center justify-center gap-0.5">
            <FiSun className="w-3 h-3" /> {profile.streakDays}d
          </span>
          <span className="text-[10px] text-slate-400">Streak</span>
        </div>
        <div className="p-1 border-x border-white/10">
          <span className="block text-xs font-bold text-purple-300 flex items-center justify-center gap-0.5">
            <FiClock className="w-3 h-3" /> {profile.totalHoursStudied}h
          </span>
          <span className="text-[10px] text-slate-400">Study Time</span>
        </div>
        <div className="p-1">
          <span className="block text-xs font-bold text-emerald-400 flex items-center justify-center gap-0.5">
            <FiDollarSign className="w-3 h-3" /> {profile.totalExpensesCount}
          </span>
          <span className="text-[10px] text-slate-400">Expenses</span>
        </div>
      </div>

      {/* ── 5. NAVIGATION MENU LINKS ───────────────────────────────────────── */}
      <div className="mt-3.5 space-y-1 border-t border-white/10 pt-2">
        <button
          onClick={() => handleNav('/profile')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 hover:text-white transition-colors group cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <FiUser className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>Full Profile & Trophy Room</span>
          </span>
          <FiChevronRight className="text-slate-500 group-hover:text-white" />
        </button>

        <button
          onClick={() => handleNav('/auth')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 hover:text-white transition-colors group cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <FiSettings className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
            <span>Account & MySQL Database</span>
          </span>
          <FiChevronRight className="text-slate-500 group-hover:text-white" />
        </button>

        <button
          onClick={() => handleNav('/settings')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 hover:text-white transition-colors group cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <FiMic className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>Voice Assistant Settings</span>
          </span>
          <FiChevronRight className="text-slate-500 group-hover:text-white" />
        </button>

        <button
          onClick={() => handleNav('/reports')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 hover:text-white transition-colors group cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <FiFileText className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Productivity & Expense Reports</span>
          </span>
          <FiChevronRight className="text-slate-500 group-hover:text-white" />
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
