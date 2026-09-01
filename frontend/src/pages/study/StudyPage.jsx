/**
 * ============================================================================
 * FILE: src/pages/study/StudyPage.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Provides an interactive Study Tracker module featuring a live Pomodoro Focus 
 *   Timer, log study session modal, subject target hours progress tracking, 
 *   and focus productivity score metrics.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import Badge from '../../components/common/Badge';
import { 
  FiBookOpen, 
  FiClock, 
  FiPlay, 
  FiPause, 
  FiRotateCcw, 
  FiPlus, 
  FiCheckCircle, 
  FiAward, 
  FiX, 
  FiTrendingUp 
} from 'react-icons/fi';
import { formatHours } from '../../utils/formatters';
import { realtimeDb } from '../../services/realtimeDbService';

const INITIAL_SUBJECTS = [
  { id: 'sub-1', name: 'Spring Boot Architecture', loggedHours: 42.5, targetHours: 50.0, color: '#8b5cf6' },
  { id: 'sub-2', name: 'React & System Design', loggedHours: 36.0, targetHours: 45.0, color: '#3b82f6' },
  { id: 'sub-3', name: 'MySQL & Database Optimization', loggedHours: 28.0, targetHours: 35.0, color: '#06b6d4' },
  { id: 'sub-4', name: 'Data Structures & Algorithms', loggedHours: 22.0, targetHours: 30.0, color: '#ec4899' },
];

const normalizeSession = (s) => {
  const numHours = parseFloat(s.hours) || (s.durationMinutes ? s.durationMinutes / 60 : 1);
  return {
    id: s.id || `s-${Date.now()}`,
    subjectName: s.subject || s.subjectName || 'Study Session',
    durationMinutes: s.durationMinutes || Math.round(numHours * 60),
    focusScore: s.focusScore || (s.progress ? Math.min(s.progress + 15, 98) : 90),
    date: s.date || 'Today',
    notes: s.notes || 'Focused study block',
    color: s.color || '#8b5cf6'
  };
};

export const StudyPage = () => {
  // Study Subjects state
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);

  // Session History State synced from Real-Time Database
  const [sessions, setSessions] = useState(() => realtimeDb.getStudySessions().map(normalizeSession));

  const syncSessions = () => {
    const rawSessions = realtimeDb.getStudySessions();
    setSessions(rawSessions.map(normalizeSession));
  };

  useEffect(() => {
    syncSessions();
    const handleDbUpdate = () => syncSessions();
    window.addEventListener('tracklytics_db_updated', handleDbUpdate);
    window.addEventListener('storage', handleDbUpdate);
    return () => {
      window.removeEventListener('tracklytics_db_updated', handleDbUpdate);
      window.removeEventListener('storage', handleDbUpdate);
    };
  }, []);

  // Pomodoro Live Timer State (25 minutes default = 1500 seconds)
  const [timerSeconds, setTimerSeconds] = useState(1500);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSubject, setTimerSubject] = useState('Spring Boot Architecture');

  // Modal open state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form State
  const [newSession, setNewSession] = useState({
    subjectName: 'Spring Boot Architecture',
    durationMinutes: 45,
    focusScore: 90,
    notes: ''
  });

  // Timer Ticking Effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      alert('🎉 Pomodoro Session Complete! Great job!');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Format MM:SS for Pomodoro
  const formatTimerTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Log session submit
  const handleLogSession = async (e) => {
    e.preventDefault();
    const durationHours = Number(newSession.durationMinutes) / 60.0;

    await realtimeDb.addStudySession({
      subject: newSession.subjectName,
      hours: durationHours,
      durationMinutes: Number(newSession.durationMinutes),
      focusScore: Number(newSession.focusScore),
      notes: newSession.notes || 'Focused study block',
      date: new Date().toISOString().split('T')[0]
    });

    // Update logged hours on subject
    setSubjects(subjects.map(sub => 
      sub.name === newSession.subjectName 
        ? { ...sub, loggedHours: Number((sub.loggedHours + durationHours).toFixed(1)) }
        : sub
    ));

    setIsLogModalOpen(false);
  };

  const totalLoggedHours = subjects.reduce((sum, s) => sum + s.loggedHours, 0);

  return (
    <div className="space-y-8">
      {/* ---------------------------------------------------------------------- */}
      {/* 1. HEADER & POMODORO WIDGET ROW                                        */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Study Tracker & Focus Timer</h2>
          <p className="text-xs text-slate-400 mt-1">Track subjects, log focus sessions, and run Pomodoro timers</p>
        </div>

        <GlassButton 
          variant="primary" 
          icon={FiPlus}
          onClick={() => setIsLogModalOpen(true)}
        >
          Log Study Session
        </GlassButton>
      </div>

      {/* Main Grid: Pomodoro Focus Timer + Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pomodoro Focus Timer Panel (5 cols) */}
        <GlassCard className="lg:col-span-5 flex flex-col justify-between items-center text-center p-8 bg-purple-950/20 border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-300">
              Live Pomodoro Timer
            </span>
          </div>

          <select
            value={timerSubject}
            onChange={(e) => setTimerSubject(e.target.value)}
            className="bg-white/5 border border-white/10 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none mb-4"
          >
            {subjects.map(s => <option key={s.id} value={s.name} className="bg-slate-900">{s.name}</option>)}
          </select>

          {/* Big Clock Display */}
          <div className="my-4 relative">
            <div className="text-6xl font-black font-mono tracking-wider text-white drop-shadow-lg">
              {formatTimerTime(timerSeconds)}
            </div>
            <p className="text-[11px] text-purple-300 mt-2">
              {isTimerRunning ? 'Session in progress...' : 'Ready to start focus block'}
            </p>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-3 mt-4">
            <GlassButton
              variant={isTimerRunning ? 'glass' : 'primary'}
              size="md"
              icon={isTimerRunning ? FiPause : FiPlay}
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            >
              {isTimerRunning ? 'Pause' : 'Start Focus'}
            </GlassButton>

            <GlassButton
              variant="ghost"
              size="md"
              icon={FiRotateCcw}
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(1500);
              }}
            >
              Reset
            </GlassButton>
          </div>
        </GlassCard>

        {/* 3 Metric Cards Column (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <GlassCard>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Hours Logged</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <FiClock className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-white mt-2 font-mono">{formatHours(totalLoggedHours)}</h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <FiTrendingUp /> +24% vs last week target
            </p>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Avg Focus Score</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <FiAward className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-white mt-2 font-mono">92.4%</h3>
            <p className="text-[11px] text-purple-300 mt-1">Top 5% productivity score</p>
          </GlassCard>

          <GlassCard className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Active Subjects</span>
              <Badge variant="purple">{subjects.length} Enrolled</Badge>
            </div>
            <p className="text-xs text-slate-300 mt-2">
              Spring Boot Architecture, React & System Design, MySQL Optimization, Data Structures
            </p>
          </GlassCard>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. SUBJECTS PROGRESS LIST                                               */}
      {/* ---------------------------------------------------------------------- */}
      <GlassCard>
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <FiBookOpen className="text-purple-400" /> Subject Goal Progress
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((sub) => {
            const percent = Math.min(100, Math.round((sub.loggedHours / sub.targetHours) * 100));
            return (
              <div key={sub.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{sub.name}</span>
                  <span className="font-mono text-purple-300">{sub.loggedHours}h / {sub.targetHours}h ({percent}%)</span>
                </div>

                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${percent}%`, backgroundColor: sub.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. SESSION HISTORY LIST                                                 */}
      {/* ---------------------------------------------------------------------- */}
      <GlassCard>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FiClock className="text-purple-400" /> Recent Study Sessions
          </h3>
          <span className="text-xs text-slate-400">{sessions.length} sessions logged</span>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No sessions logged yet. Click <span className="text-purple-400 font-semibold">Log Study Session</span> to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const subjectColor = subjects.find(sub => sub.name === s.subjectName)?.color || '#8b5cf6';
              const hrs = Math.floor(s.durationMinutes / 60);
              const mins = s.durationMinutes % 60;
              const durationLabel = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/8 border border-white/5 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Subject color dot */}
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10"
                      style={{ backgroundColor: `${subjectColor}18`, color: subjectColor }}
                    >
                      <FiBookOpen className="w-4 h-4" />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {s.subjectName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3 h-3 text-purple-400" /> {durationLabel}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FiAward className="w-3 h-3 text-cyan-400" /> {s.focusScore}% focus
                        </span>
                        <span>•</span>
                        <span className="text-slate-500">{s.date}</span>
                      </div>
                      {s.notes && (
                        <p className="text-[11px] text-slate-500 mt-1 italic">"{s.notes}"</p>
                      )}
                    </div>
                  </div>

                  {/* Focus Score Badge */}
                  <div
                    className="shrink-0 px-3 py-1 rounded-xl text-xs font-bold font-mono border"
                    style={{
                      color: s.focusScore >= 90 ? '#34d399' : s.focusScore >= 75 ? '#a78bfa' : '#f59e0b',
                      borderColor: s.focusScore >= 90 ? '#34d39930' : s.focusScore >= 75 ? '#a78bfa30' : '#f59e0b30',
                      backgroundColor: s.focusScore >= 90 ? '#34d39910' : s.focusScore >= 75 ? '#a78bfa10' : '#f59e0b10',
                    }}
                  >
                    {s.focusScore}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* ---------------------------------------------------------------------- */}
      {/* 4. LOG STUDY SESSION MODAL                                             */}
      {/* ---------------------------------------------------------------------- */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="water-glass-panel w-full max-w-lg rounded-3xl p-6 border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FiPlus className="text-purple-400" /> Log Study Session
              </h3>
              <button 
                onClick={() => setIsLogModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/10"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <select
                  value={newSession.subjectName}
                  onChange={(e) => setNewSession({ ...newSession, subjectName: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="60"
                    value={newSession.durationMinutes}
                    onChange={(e) => setNewSession({ ...newSession, durationMinutes: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Focus Score (1 - 100)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    placeholder="90"
                    value={newSession.focusScore}
                    onChange={(e) => setNewSession({ ...newSession, focusScore: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Session Notes</label>
                <input
                  type="text"
                  placeholder="What topics did you master?"
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <GlassButton type="button" variant="ghost" onClick={() => setIsLogModalOpen(false)}>
                  Cancel
                </GlassButton>
                <GlassButton type="submit" variant="primary">
                  Save Session
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPage;
