/**
 * ============================================================================
 * FILE: src/context/UserProfileContext.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Central state store for the User Profile, Gamification (Level, XP, Streaks),
 *   Avatar customization, Status indicator, and Personal Settings across Tracklytics.
 *
 * FEATURES:
 *   - Live user identity (Name, Username, Bio, Role, Email, Location, Socials).
 *   - Gamification engine (Level progression, XP calculation, Streak counter, Badges).
 *   - Live Status Selector (Active, Focus Mode, Coffee Break, Do Not Disturb).
 *   - Avatar presets and custom avatar URLs.
 *   - Automatic persistence to localStorage.
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserProfileContext = createContext(null);

const STORAGE_KEY = 'tracklytics_user_profile_v2';

export const AVATAR_PRESETS = [
  {
    id: 'avatar-1',
    name: 'Cyberpunk Aurora',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'avatar-2',
    name: 'Neon Tech Guy',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'avatar-3',
    name: 'AI Scientist',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'avatar-4',
    name: 'Minimalist Coder',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'avatar-5',
    name: 'Design Lead',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'avatar-6',
    name: 'Pixel Explorer',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
  },
];

export const STATUS_OPTIONS = [
  { id: 'active', label: 'Online', emoji: '🟢', color: '#10b981', desc: 'Available & active' },
  { id: 'focus', label: 'Deep Focus', emoji: '🌙', color: '#8b5cf6', desc: 'Studying / Coding' },
  { id: 'break', label: 'Coffee Break', emoji: '☕', color: '#f59e0b', desc: 'Back in 15 mins' },
  { id: 'busy', label: 'Do Not Disturb', emoji: '🔴', color: '#ef4444', desc: 'In a deep session' },
];

export const CURRENCY_OPTIONS = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', locale: 'en-IN', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', locale: 'en-US', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', locale: 'de-DE', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', locale: 'en-GB', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)', locale: 'ja-JP', flag: '🇯🇵' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', locale: 'en-CA', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AUD)', locale: 'en-AU', flag: '🇦🇺' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)', locale: 'ar-AE', flag: '🇦🇪' },
  { code: 'SGD', symbol: 'SG$', name: 'Singapore Dollar (SGD)', locale: 'en-SG', flag: '🇸🇬' },
];

export const INITIAL_BADGES = [
  {
    id: 'badge-1',
    title: 'Streak Master',
    icon: '🔥',
    desc: 'Maintained a 14-day study & tracking streak',
    unlocked: true,
    unlockedAt: 'Aug 2026',
    tier: 'Gold',
  },
  {
    id: 'badge-2',
    title: 'Voice Pilot',
    icon: '🎙️',
    desc: 'Executed 50+ voice assistant commands with MAPLA',
    unlocked: true,
    unlockedAt: 'Aug 2026',
    tier: 'Platinum',
  },
  {
    id: 'badge-3',
    title: 'Budget Sentinel',
    icon: '🛡️',
    desc: 'Kept monthly expenses strictly under 80% of budget limit',
    unlocked: true,
    unlockedAt: 'Jul 2026',
    tier: 'Diamond',
  },
  {
    id: 'badge-4',
    title: 'Night Owl Coder',
    icon: '🦉',
    desc: 'Logged 20+ study sessions past 10 PM',
    unlocked: true,
    unlockedAt: 'Aug 2026',
    tier: 'Silver',
  },
  {
    id: 'badge-5',
    title: 'Analytics Guru',
    icon: '📊',
    desc: 'Generated and analyzed 10 weekly reports',
    unlocked: false,
    progress: 70,
    tier: 'Gold',
  },
  {
    id: 'badge-6',
    title: 'Master Scholar',
    icon: '🎓',
    desc: 'Reach 100 total hours logged in Study Tracker',
    unlocked: false,
    progress: 65,
    tier: 'Obsidian',
  },
];

export const DEFAULT_HABITS = [
  { id: 'h1', title: 'Complete 2h Deep Study', xp: 60, completed: true, icon: '📚', category: 'Study' },
  { id: 'h2', title: 'Log & Categorize Daily Expenses', xp: 40, completed: true, icon: '💳', category: 'Finance' },
  { id: 'h3', title: 'Code Spring Boot / React Features', xp: 80, completed: false, icon: '💻', category: 'Development' },
  { id: 'h4', title: 'Run Voice Assistant Commands (MAPLA)', xp: 50, completed: true, icon: '🎙️', category: 'Voice' },
  { id: 'h5', title: 'Review Weekly Budget & Goals', xp: 50, completed: false, icon: '🛡️', category: 'Finance' },
];

export const INITIAL_ACTIVITY_HEATMAP = Array.from({ length: 28 }, (_, i) => {
  const dayNum = 28 - i;
  const intensities = [0, 1, 2, 3, 4];
  // More realistic distribution with high activity on recent days
  const level = i > 22 ? Math.floor(Math.random() * 2) + 3 : (i % 5 === 0 ? 1 : (i % 3 === 0 ? 3 : 2));
  return {
    dayIndex: i,
    date: `Day -${dayNum}`,
    level: level, // 0 to 4
    hours: (level * 1.5).toFixed(1),
    expenses: level * 2,
  };
});

const DEFAULT_PROFILE = {
  fullName: 'Hari Prasath',
  username: 'hariprasath',
  email: 'hari@tracklytics.com',
  phone: '+91 98765 43210',
  location: 'Chennai, India',
  title: 'Full-Stack Developer & AI Researcher',
  bio: 'Building intelligent data systems, mastering Spring Boot & React, and optimizing daily productivity. 🚀',
  avatarUrl: AVATAR_PRESETS[0].url,
  status: 'active', // 'active' | 'focus' | 'break' | 'busy'
  currency: 'INR',
  currencySymbol: '₹',
  monthlyBudget: 35000,
  currentMonthSpent: 18450,
  weeklyStudyGoalHours: 28,
  currentWeekStudiedHours: 21.5,
  dailyTargetHours: 4.0,
  level: 8,
  levelTitle: 'Productivity Architect',
  currentXp: 3850,
  nextLevelXp: 5000,
  streakDays: 14,
  lastStreakClaimDate: null,
  totalHoursStudied: 65.5,
  totalExpensesCount: 42,
  voiceCommandsCount: 88,
  badges: INITIAL_BADGES,
  habits: DEFAULT_HABITS,
  activityHeatmap: INITIAL_ACTIVITY_HEATMAP,
  socialLinks: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://x.com',
    website: 'https://tracklytics.com',
  },
  joinedDate: 'January 2026',
};

export const UserProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
      return DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage:', e);
    }
  }, [profile]);

  // Update profile fields
  const updateProfile = useCallback((updates) => {
    setProfile((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Update Avatar URL
  const updateAvatar = useCallback((url) => {
    setProfile((prev) => ({
      ...prev,
      avatarUrl: url,
    }));
  }, []);

  // Update User Status
  const updateStatus = useCallback((statusId) => {
    setProfile((prev) => ({
      ...prev,
      status: statusId,
    }));
  }, []);

  // Add XP and handle level up
  const addXp = useCallback((amount) => {
    setProfile((prev) => {
      let newXp = prev.currentXp + amount;
      let newLevel = prev.level;
      let nextXp = prev.nextLevelXp;

      while (newXp >= nextXp) {
        newXp -= nextXp;
        newLevel += 1;
        nextXp = Math.round(nextXp * 1.25);
      }

      return {
        ...prev,
        level: newLevel,
        currentXp: newXp,
        nextLevelXp: nextXp,
      };
    });
  }, []);

  // Toggle daily habit & grant XP on completion
  const toggleHabit = useCallback((habitId) => {
    setProfile((prev) => {
      const targetHabit = prev.habits?.find((h) => h.id === habitId);
      const isCompleting = !targetHabit?.completed;
      const xpBonus = isCompleting ? (targetHabit?.xp || 50) : 0;

      let newXp = prev.currentXp + xpBonus;
      let newLevel = prev.level;
      let nextXp = prev.nextLevelXp;

      while (newXp >= nextXp) {
        newXp -= nextXp;
        newLevel += 1;
        nextXp = Math.round(nextXp * 1.25);
      }

      const updatedHabits = (prev.habits || DEFAULT_HABITS).map((h) =>
        h.id === habitId ? { ...h, completed: !h.completed } : h
      );

      return {
        ...prev,
        habits: updatedHabits,
        currentXp: newXp,
        level: newLevel,
        nextLevelXp: nextXp,
      };
    });
  }, []);

  // Claim Daily Streak Bonus
  const claimStreakReward = useCallback(() => {
    const todayStr = new Date().toDateString();
    let rewardGiven = false;

    setProfile((prev) => {
      if (prev.lastStreakClaimDate === todayStr) {
        return prev;
      }
      rewardGiven = true;
      let newXp = prev.currentXp + 150;
      let newLevel = prev.level;
      let nextXp = prev.nextLevelXp;

      while (newXp >= nextXp) {
        newXp -= nextXp;
        newLevel += 1;
        nextXp = Math.round(nextXp * 1.25);
      }

      return {
        ...prev,
        streakDays: prev.streakDays + 1,
        lastStreakClaimDate: todayStr,
        currentXp: newXp,
        level: newLevel,
        nextLevelXp: nextXp,
      };
    });

    return rewardGiven;
  }, []);

  // Update Currency & Symbol
  const updateCurrency = useCallback((currencyCode) => {
    const opt = CURRENCY_OPTIONS.find((c) => c.code === currencyCode) || CURRENCY_OPTIONS[0];
    setProfile((prev) => ({
      ...prev,
      currency: opt.code,
      currencySymbol: opt.symbol,
      currencyLocale: opt.locale,
    }));
  }, []);

  // Reset to default
  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }, []);

  const value = {
    profile,
    updateProfile,
    updateAvatar,
    updateStatus,
    updateCurrency,
    addXp,
    toggleHabit,
    claimStreakReward,
    resetProfile,
    avatarPresets: AVATAR_PRESETS,
    statusOptions: STATUS_OPTIONS,
    currencyOptions: CURRENCY_OPTIONS,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) {
    throw new Error('useUserProfile must be used within a <UserProfileProvider>');
  }
  return ctx;
};

export default UserProfileProvider;
