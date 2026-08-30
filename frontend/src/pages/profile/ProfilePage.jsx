/**
 * ============================================================================
 * FILE: src/pages/profile/ProfilePage.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Rich, gamified, interactive User Profile & Productivity Command Center
 *   for Tracklytics.
 *
 * SECTIONS:
 *   1. Hero Banner: Avatar customizer, live status badge, level & XP progression bar.
 *   2. Productivity & Budget Targets: Live weekly study hours & monthly expense limit gauges.
 *   3. Daily Habit Tracker: Interactive checkable habit cards granting live XP.
 *   4. Activity Heatmap: 28-day GitHub-style productivity intensity matrix.
 *   5. Achievement Trophy Showcase: Badges with tier badges & unlock progress.
 *   6. Bio & Social Connectivity: Editable bio, professional role, GitHub, LinkedIn, Twitter.
 *   7. System & Voice Assistant Hub: Wake word info, voice launcher, JSON backup & DB health.
 * ============================================================================
 */

import React, { useState, useRef } from 'react';
import { useUserProfile } from '../../context/UserProfileContext';
import { useVoice } from '../../context/VoiceContext';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import {
  FiUser,
  FiEdit3,
  FiCheck,
  FiAward,
  FiSun,
  FiClock,
  FiDollarSign,
  FiMic,
  FiDownload,
  FiMapPin,
  FiMail,
  FiGlobe,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiZap,
  FiCheckCircle,
  FiCamera,
  FiX,
  FiTarget,
  FiActivity,
  FiPlay,
  FiUploadCloud,
  FiImage
} from 'react-icons/fi';

const COVER_THEMES = [
  { id: 'aurora', name: 'Aurora Cyber', gradient: 'from-purple-900 via-indigo-900 to-slate-900' },
  { id: 'emerald', name: 'Emerald Forest', gradient: 'from-emerald-900 via-teal-900 to-slate-900' },
  { id: 'sunset', name: 'Sunset Glow', gradient: 'from-rose-900 via-purple-900 to-slate-900' },
  { id: 'midnight', name: 'Midnight Deep', gradient: 'from-slate-950 via-slate-900 to-purple-950' },
  { id: 'cyber', name: 'Cyber Matrix', gradient: 'from-cyan-950 via-slate-900 to-emerald-950' },
];

export const ProfilePage = () => {
  const {
    profile,
    updateProfile,
    updateAvatar,
    updateStatus,
    addXp,
    toggleHabit,
    claimStreakReward,
    resetProfile,
    avatarPresets,
    statusOptions,
  } = useUserProfile();

  const { activateDirectly } = useVoice();

  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [coverTheme, setCoverTheme] = useState('aurora');
  const [toastMessage, setToastMessage] = useState('');
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // File input ref for laptop image selection
  const fileInputRef = useRef(null);

  // Local form state for editing
  const [formData, setFormData] = useState({ ...profile });

  const currentTheme = COVER_THEMES.find((t) => t.id === coverTheme) || COVER_THEMES[0];
  const currentStatus = statusOptions.find((s) => s.id === profile.status) || statusOptions[0];

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    triggerToast('Profile & Preferences updated successfully! ✨');
  };

  const handleSelectPreset = (url) => {
    updateAvatar(url);
    setShowAvatarModal(false);
    triggerToast('Avatar updated!');
  };

  const handleCustomAvatarSubmit = (e) => {
    e.preventDefault();
    if (customAvatarUrl.trim()) {
      updateAvatar(customAvatarUrl.trim());
      setCustomAvatarUrl('');
      setShowAvatarModal(false);
      triggerToast('Custom Avatar applied!');
    }
  };

  // Handle image upload from user's computer/laptop
  const processImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerToast('⚠️ Please choose an image file (PNG, JPG, JPEG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      triggerToast('⚠️ Image size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result;
      if (base64Data) {
        updateAvatar(base64Data);
        setShowAvatarModal(false);
        triggerToast('Profile picture uploaded from your laptop! 📸✨');
      }
    };
    reader.onerror = () => {
      triggerToast('⚠️ Error reading image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
      e.target.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleClaimDailyStreak = () => {
    const success = claimStreakReward();
    if (success) {
      triggerToast('🔥 Streak reward claimed: +150 XP & Streak extended!');
    } else {
      triggerToast('⚡ You have already claimed today\'s bonus! Come back tomorrow.');
    }
  };

  const handleHabitCheck = (habitId, title, xp) => {
    toggleHabit(habitId);
    triggerToast(`Habit updated: "${title}" ✨`);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tracklytics-profile-${profile.username}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Profile & Productivity data exported as JSON!');
  };

  const xpPercent = Math.min(100, Math.round((profile.currentXp / profile.nextLevelXp) * 100));
  const studyGoalPercent = Math.min(100, Math.round(((profile.currentWeekStudiedHours || 21.5) / (profile.weeklyStudyGoalHours || 28)) * 100));
  const budgetSpentPercent = Math.min(100, Math.round(((profile.currentMonthSpent || 18450) / (profile.monthlyBudget || 35000)) * 100));
  const completedHabitsCount = (profile.habits || []).filter((h) => h.completed).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Hidden File Input for Device/Laptop Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-slate-900/95 border border-purple-500/50 text-white text-sm shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5">
          <FiCheckCircle className="text-emerald-400 w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. HERO PROFILE GLASS BANNER ───────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900/60 backdrop-blur-2xl">
        {/* Cover Gradient */}
        <div className={`h-48 sm:h-60 bg-gradient-to-r ${currentTheme.gradient} relative p-6 flex items-start justify-between`}>
          {/* Cover theme picker pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            {COVER_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setCoverTheme(theme.id)}
                title={theme.name}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  coverTheme === theme.id
                    ? 'bg-white/20 text-white shadow-sm border border-white/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {theme.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClaimDailyStreak}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-orange-500/30 to-yellow-500/30 hover:from-orange-500/40 hover:to-yellow-500/40 border border-orange-500/40 text-white text-xs font-bold backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <FiSun className="w-4 h-4 text-yellow-400" />
              <span>Claim Streak Bonus (+150 XP)</span>
            </button>

            <button
              onClick={handleExportData}
              className="p-2.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 text-slate-300 hover:text-white transition-all backdrop-blur-md cursor-pointer"
              title="Export Profile JSON"
            >
              <FiDownload className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Details Bar */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            {/* Avatar & Core Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              {/* Avatar with Status & Edit Ring */}
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-tr from-purple-500 via-indigo-400 to-pink-500 shadow-2xl">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-full h-full rounded-[22px] object-cover bg-slate-900 border-2 border-slate-900"
                    />
                  </div>

                  {/* Status Dot */}
                  <span
                    className="absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-slate-900 shadow-md flex items-center justify-center text-[10px]"
                    style={{ backgroundColor: currentStatus.color }}
                    title={`Status: ${currentStatus.label}`}
                  />

                  {/* Change Avatar Button Overlay - Directly triggers File Manager */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="absolute inset-0 rounded-3xl bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold gap-1 transition-opacity backdrop-blur-xs cursor-pointer"
                    title="Open Laptop File Manager"
                  >
                    <FiUploadCloud className="w-6 h-6 text-purple-300 animate-bounce" />
                    <span className="text-[11px] font-bold">Choose from PC</span>
                  </button>
                </div>

                {/* Direct Laptop Image Picker Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-[11px] font-bold transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                >
                  <FiImage className="w-3.5 h-3.5 text-purple-400" />
                  <span>Choose Image</span>
                </button>
              </div>

              {/* Names & Level Badge */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {profile.fullName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <FiAward className="w-3.5 h-3.5 text-purple-400" /> Lv.{profile.level} · {profile.levelTitle}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-purple-300/80 font-mono">@{profile.username} • {profile.title}</p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1"><FiMapPin className="text-slate-500" /> {profile.location}</span>
                  <span className="flex items-center gap-1"><FiMail className="text-slate-500" /> {profile.email}</span>
                  <span className="flex items-center gap-1 text-orange-400 font-semibold">
                    <FiSun className="text-orange-400 w-3.5 h-3.5" /> {profile.streakDays}-Day Streak
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Status Dropdown & Edit Profile */}
            <div className="flex items-center justify-center sm:justify-end gap-3">
              {/* Status Switcher Dropdown */}
              <div className="relative group">
                <select
                  value={profile.status}
                  onChange={(e) => {
                    updateStatus(e.target.value);
                    triggerToast(`Status set to ${statusOptions.find(s => s.id === e.target.value)?.label}`);
                  }}
                  className="bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold rounded-2xl px-3.5 py-2.5 backdrop-blur-md cursor-pointer outline-none transition-all shadow-sm"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-slate-900 text-white">
                      {opt.emoji} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <GlassButton
                variant={isEditing ? 'secondary' : 'primary'}
                icon={isEditing ? FiX : FiEdit3}
                onClick={() => {
                  setFormData({ ...profile });
                  setIsEditing(!isEditing);
                }}
              >
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </GlassButton>
            </div>
          </div>

          {/* XP Level Progression Bar */}
          <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <FiZap className="text-yellow-400 w-3.5 h-3.5" /> Level {profile.level} Progression · {profile.levelTitle}
              </span>
              <span className="font-mono text-purple-300">
                {profile.currentXp.toLocaleString()} / {profile.nextLevelXp.toLocaleString()} XP ({xpPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 transition-all duration-700 shadow-lg shadow-purple-500/50"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. EDIT PROFILE FORM MODAL / EXPANDED SECTION ───────────────────── */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="animate-in fade-in slide-in-from-top-4 duration-300">
          <GlassCard className="border-purple-500/40 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FiEdit3 className="text-purple-400" /> Edit Profile & Productivity Goals
              </h3>
              <span className="text-xs text-slate-400">Saves locally and syncs with Tracklytics</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Professional Role / Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Monthly Budget Target (₹)</label>
                <input
                  type="number"
                  value={formData.monthlyBudget}
                  onChange={(e) => setFormData({ ...formData, monthlyBudget: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Weekly Study Goal (Hours)</label>
                <input
                  type="number"
                  value={formData.weeklyStudyGoalHours}
                  onChange={(e) => setFormData({ ...formData, weeklyStudyGoalHours: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Currency Format</label>
                <select
                  value={formData.currency}
                  onChange={(e) => {
                    const sym = e.target.value === 'INR' ? '₹' : e.target.value === 'USD' ? '$' : '€';
                    setFormData({ ...formData, currency: e.target.value, currencySymbol: sym });
                  }}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="EUR">€ EUR (Euro)</option>
                  <option value="GBP">£ GBP (British Pound)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">About You / Productivity Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="Tell us about your productivity journey..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
              <GlassButton type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </GlassButton>
              <GlassButton type="submit" variant="primary" icon={FiCheck}>
                Save Changes
              </GlassButton>
            </div>
          </GlassCard>
        </form>
      )}

      {/* ── 3. PRODUCTIVITY & BUDGET TARGET GAUGES ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Study Goal Gauge */}
        <GlassCard className="p-5 relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <FiClock className="w-4 h-4 text-purple-400" /> Weekly Study Goal
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {studyGoalPercent}% Done
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {profile.currentWeekStudiedHours || 21.5}h
            </span>
            <span className="text-xs text-slate-400">
              / {profile.weeklyStudyGoalHours || 28}h target
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500"
              style={{ width: `${studyGoalPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5">
            6.5 hours remaining to hit this week's target! Keep going! 🚀
          </p>
        </GlassCard>

        {/* Budget Sentinel Gauge */}
        <GlassCard className="p-5 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <FiDollarSign className="w-4 h-4 text-emerald-400" /> Monthly Budget Guard
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {budgetSpentPercent}% Used
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {profile.currencySymbol || '₹'}{(profile.currentMonthSpent || 18450).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">
              / {profile.currencySymbol || '₹'}{(profile.monthlyBudget || 35000).toLocaleString()}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${budgetSpentPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-emerald-400/90 mt-2.5">
            Safe Zone: {profile.currencySymbol || '₹'}{((profile.monthlyBudget || 35000) - (profile.currentMonthSpent || 18450)).toLocaleString()} remaining this month.
          </p>
        </GlassCard>

        {/* Voice Assistant & Milestones */}
        <GlassCard className="p-5 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <FiMic className="w-4 h-4 text-indigo-400" /> Voice Assistant
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Wake: "MAPLA"
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {profile.voiceCommandsCount}
            </span>
            <span className="text-xs text-slate-400">Commands Handled</span>
          </div>

          <div className="mt-3">
            <GlassButton
              variant="primary"
              size="sm"
              icon={FiPlay}
              onClick={() => {
                if (activateDirectly) {
                  activateDirectly();
                  triggerToast('Continuous Voice Mode activated! Say your command...');
                } else {
                  triggerToast('Voice Assistant is active. Say "MAPLA" or click Header Mic!');
                }
              }}
              className="w-full justify-center text-xs py-2 cursor-pointer"
            >
              Start Continuous Voice Mode
            </GlassButton>
          </div>
        </GlassCard>
      </div>

      {/* ── 4. DAILY HABIT TRACKER & XP ACCELERATOR ──────────────────────────── */}
      <GlassCard className="border-purple-500/30 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-4 mb-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiTarget className="text-purple-400" /> Daily Habits & XP Accelerator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Check off your daily productivity habits to earn XP and level up faster!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {completedHabitsCount} / {(profile.habits || []).length} Completed Today
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(profile.habits || []).map((habit) => (
            <div
              key={habit.id}
              onClick={() => handleHabitCheck(habit.id, habit.title, habit.xp)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                habit.completed
                  ? 'bg-purple-500/10 border-purple-500/40 text-white shadow-md shadow-purple-950/20'
                  : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300 hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                    habit.completed
                      ? 'bg-purple-500 border-purple-400 text-white'
                      : 'border-white/20 bg-white/5 text-transparent'
                  }`}
                >
                  <FiCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{habit.title}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>{habit.icon}</span>
                    <span>{habit.category}</span>
                  </div>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  habit.completed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}
              >
                +{habit.xp} XP
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── 5. 28-DAY PRODUCTIVITY ACTIVITY HEATMAP ─────────────────────────── */}
      <GlassCard>
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiActivity className="text-emerald-400" /> 28-Day Productivity Heatmap
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visual log of study sessions, expense entries, and consistency
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-xs bg-white/5 border border-white/10" />
            <div className="w-2.5 h-2.5 rounded-xs bg-purple-900/60" />
            <div className="w-2.5 h-2.5 rounded-xs bg-purple-700" />
            <div className="w-2.5 h-2.5 rounded-xs bg-purple-500" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-400" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
            {(profile.activityHeatmap || []).map((day, idx) => {
              const bgColors = [
                'bg-white/5 border-white/10 hover:border-white/30',
                'bg-purple-950/80 border-purple-900 hover:border-purple-600',
                'bg-purple-800 border-purple-700 hover:border-purple-400',
                'bg-purple-600 border-purple-500 hover:border-purple-300',
                'bg-emerald-500 border-emerald-400 hover:border-emerald-200 shadow-sm shadow-emerald-500/40',
              ];
              const colorClass = bgColors[day.level] || bgColors[0];

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedHeatmapDay(day)}
                  className={`h-10 rounded-xl border flex flex-col items-center justify-center p-1 cursor-pointer transition-all hover:scale-105 ${colorClass}`}
                  title={`${day.date}: ${day.hours}h study, ${day.expenses} expenses`}
                >
                  <span className="text-[9px] font-mono text-white/70">D{idx + 1}</span>
                  <span className="text-[10px] font-bold text-white">{day.hours}h</span>
                </div>
              );
            })}
          </div>

          {selectedHeatmapDay && (
            <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-between">
              <span>
                📅 <strong>{selectedHeatmapDay.date} Activity:</strong> Logged{' '}
                <strong>{selectedHeatmapDay.hours} hours</strong> of study and{' '}
                <strong>{selectedHeatmapDay.expenses} transactions</strong>.
              </span>
              <button
                onClick={() => setSelectedHeatmapDay(null)}
                className="text-slate-400 hover:text-white text-xs ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* ── 6. TROPHY & ACHIEVEMENT SHOWCASE ────────────────────────────────── */}
      <GlassCard>
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiAward className="text-yellow-400" /> Trophies & Achievements
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Unlocked milestones across Tracklytics</p>
          </div>
          <span className="text-xs font-mono text-purple-300 px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30">
            {profile.badges.filter(b => b.unlocked).length} / {profile.badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                badge.unlocked
                  ? 'bg-white/5 border-purple-500/30 hover:border-purple-500/60 shadow-lg shadow-purple-950/20'
                  : 'bg-white/[0.02] border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-3xl p-2 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                  {badge.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{badge.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10 shrink-0">
                      {badge.tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{badge.desc}</p>
                  
                  {badge.unlocked ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-3">
                      <FiCheckCircle className="w-3.5 h-3.5" /> Unlocked ({badge.unlockedAt})
                    </div>
                  ) : (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Progress</span>
                        <span>{badge.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${badge.progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── 7. BIO & CONNECTIVITY ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bio & Summary Card */}
        <GlassCard>
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <FiUser className="text-purple-400" /> Bio & Preferences
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed italic bg-white/5 p-4 rounded-2xl border border-white/10">
            "{profile.bio}"
          </p>

          <div className="mt-5 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Member Since</span>
              <span className="font-semibold text-white">{profile.joinedDate}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Current Status</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                {currentStatus.emoji} {currentStatus.label}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">Voice Assistant Engine</span>
              <span className="font-mono text-[11px] text-purple-300">en-IN (Continuous MAPLA)</span>
            </div>
          </div>
        </GlassCard>

        {/* Social Links & Web */}
        <GlassCard>
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <FiGlobe className="text-indigo-400" /> Social & Developer Links
          </h3>

          <div className="space-y-3">
            <a
              href={profile.socialLinks?.github || 'https://github.com'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs text-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <FiGithub className="w-4 h-4 text-slate-400" />
                <span>GitHub Developer Profile</span>
              </div>
              <span className="text-purple-400 text-[11px]">View →</span>
            </a>

            <a
              href={profile.socialLinks?.linkedin || 'https://linkedin.com'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs text-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <FiLinkedin className="w-4 h-4 text-blue-400" />
                <span>LinkedIn Network</span>
              </div>
              <span className="text-purple-400 text-[11px]">Connect →</span>
            </a>

            <a
              href={profile.socialLinks?.twitter || 'https://x.com'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs text-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <FiTwitter className="w-4 h-4 text-sky-400" />
                <span>Twitter / X</span>
              </div>
              <span className="text-purple-400 text-[11px]">Follow →</span>
            </a>
          </div>
        </GlassCard>
      </div>

      {/* ── 8. AVATAR & PHOTO CUSTOMIZER SECTION ──────────────────────────── */}
      <GlassCard className="border-purple-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FiCamera className="text-purple-400" /> Profile Picture & Character Gallery
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload any photo directly from your laptop or select a character preset
            </p>
          </div>

          <GlassButton
            variant="primary"
            size="sm"
            icon={FiUploadCloud}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer"
          >
            Upload from Laptop
          </GlassButton>
        </div>

        {/* Laptop Drag & Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer mb-6 ${
            isDraggingOver
              ? 'border-purple-400 bg-purple-500/20 scale-[1.01]'
              : 'border-purple-500/40 hover:border-purple-400 bg-black/20 hover:bg-purple-950/20'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-2">
            <FiUploadCloud className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-sm font-bold text-white">
            Click to choose photo from your laptop / PC
          </p>
          <p className="text-xs text-slate-400 mt-1">
            PNG, JPG, JPEG, WEBP, GIF (Max 10MB) • Or drag & drop here
          </p>
        </div>

        {/* Character Presets Grid */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-300 block">
            Or choose a 3D Cyber character:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {avatarPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.url)}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all p-1 group cursor-pointer ${
                  profile.avatarUrl === preset.url
                    ? 'border-purple-500 ring-2 ring-purple-500/50 scale-105 bg-purple-500/20'
                    : 'border-white/10 hover:border-white/30 bg-white/5'
                }`}
              >
                <img src={preset.url} alt={preset.name} className="w-full h-16 rounded-xl object-cover" />
                <span className="block text-[10px] text-center font-medium text-slate-300 mt-1 truncate">
                  {preset.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom URL Input */}
        <form onSubmit={handleCustomAvatarSubmit} className="pt-4 mt-5 border-t border-white/10 flex flex-col sm:flex-row gap-2.5 items-center">
          <input
            type="url"
            placeholder="Or paste any custom image URL (https://...)"
            value={customAvatarUrl}
            onChange={(e) => setCustomAvatarUrl(e.target.value)}
            className="w-full flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
          />
          <GlassButton type="submit" variant="secondary" size="sm" className="w-full sm:w-auto shrink-0">
            Apply URL
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
};

export default ProfilePage;
