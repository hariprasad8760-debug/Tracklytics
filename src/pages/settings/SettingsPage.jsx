/**
 * ============================================================================
 * FILE: src/pages/settings/SettingsPage.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Provides the Settings hub for the application. Currently contains the
 *   Voice Assistant configuration section for changing the wake word and
 *   a complete reference of all supported Voice Navigation Commands.
 * ============================================================================
 */

import React, { useState } from 'react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import { useVoice } from '../../context/VoiceContext';
import {
  FiMic, FiCheck, FiEdit2, FiAlertCircle, FiZap, FiCompass, FiCornerDownLeft
} from 'react-icons/fi';

const PRESET_WORDS = ['MAPLA', 'TRACKLYTICS', 'ZENO', 'NOVA', 'HEY TRACK'];

const SUPPORTED_COMMANDS = [
  {
    destination: 'Dashboard / Home',
    path: '/',
    phrases: ['“Go to dashboard”', '“Open home”', '“Take me to overview”', '“Show dashboard”'],
  },
  {
    destination: 'Expenses',
    path: '/expense',
    phrases: ['“Open expenses”', '“Take me to expenses”', '“Show my expenses”', '“Open expense section”'],
  },
  {
    destination: 'Study Tracker',
    path: '/study',
    phrases: ['“Open study”', '“Go to study tracker”', '“Show focus timer”', '“Open goals”'],
  },
  {
    destination: 'Analytics',
    path: '/analytics',
    phrases: ['“Show analytics”', '“Open analytics”', '“View analytics”', '“Show charts”'],
  },
  {
    destination: 'Calendar',
    path: '/calendar',
    phrases: ['“Open calendar”', '“Show my schedule”', '“Go to calendar”', '“Open planner”'],
  },
  {
    destination: 'Reports',
    path: '/reports',
    phrases: ['“Open reports”', '“Show summary reports”', '“Download reports”', '“View reports”'],
  },
  {
    destination: 'Settings',
    path: '/settings',
    phrases: ['“Open settings”', '“Go to preferences”', '“Voice settings”', '“Show config”'],
  },
  {
    destination: 'Previous Page',
    path: 'BACK',
    phrases: ['“Go back”', '“Previous page”', '“Return”', '“Back”'],
  },
];

export const SettingsPage = () => {
  const {
    wakeWord,
    wakeWordEnabled,
    micPermission,
    updateWakeWord,
    toggleWakeWordEnabled,
    activateVoiceMode,
  } = useVoice();

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(wakeWord);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!draft.trim()) return;
    updateWakeWord(draft.trim());
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePreset = (word) => {
    updateWakeWord(word);
    setDraft(word);
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Configure your Tracklytics experience</p>
      </div>

      {/* ── VOICE ASSISTANT SECTION ──────────────────────────────────────── */}
      <GlassCard>
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/8">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
            <FiMic className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Voice Assistant & Wake Word</h3>
            <p className="text-xs text-slate-400 mt-0.5">Wake word detection and voice navigation settings</p>
          </div>
          <div className="ml-auto">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                wakeWordEnabled
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${wakeWordEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              {wakeWordEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Mic Permission Warning */}
        {micPermission === 'denied' && (
          <div className="flex items-start gap-3 p-4 rounded-2xl mb-5 bg-red-500/8 border border-red-500/20">
            <FiAlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-400">Microphone access denied</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Please allow microphone access in your browser settings and refresh the page to enable voice activation.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Enable / Disable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/4 border border-white/6">
            <div>
              <p className="text-sm font-semibold text-white">Enable Wake Word Detection</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Continuously listen for <span className="text-purple-400 font-bold">"{wakeWord}"</span> to activate voice navigation
              </p>
            </div>
            {/* Toggle switch */}
            <button
              onClick={() => toggleWakeWordEnabled(!wakeWordEnabled)}
              className="relative inline-flex w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ml-4"
              style={{
                background: wakeWordEnabled
                  ? 'linear-gradient(90deg, #7c3aed, #6d28d9)'
                  : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
              role="switch"
              aria-checked={wakeWordEnabled}
            >
              <span
                className="inline-block w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 mt-0.5"
                style={{ transform: wakeWordEnabled ? 'translateX(20px)' : 'translateX(2px)' }}
              />
            </button>
          </div>

          {/* Current Wake Word display */}
          <div className="p-4 rounded-2xl bg-white/4 border border-white/6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Wake Word</p>
                <p className="text-xs text-slate-400 mt-0.5">Say this word to activate voice mode instantly</p>
              </div>

              {!editMode && (
                <button
                  onClick={() => { setEditMode(true); setDraft(wakeWord); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
                >
                  <FiEdit2 className="w-3 h-3" />
                  Change Wake Word
                </button>
              )}
            </div>

            {/* Current wake word pill */}
            {!editMode && (
              <div className="flex items-center gap-3">
                <div
                  className="px-5 py-3 rounded-2xl font-mono font-bold text-lg tracking-[0.15em] text-white"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(109,40,217,0.1))',
                    border: '1.5px solid rgba(139,92,246,0.35)',
                    boxShadow: '0 0 20px rgba(139,92,246,0.1)',
                  }}
                >
                  {wakeWord}
                </div>
                {saved && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-in fade-in duration-200">
                    <FiCheck className="w-3.5 h-3.5" /> Saved!
                  </span>
                )}
              </div>
            )}

            {/* Edit mode input */}
            {editMode && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.toUpperCase())}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditMode(false); }}
                  placeholder="e.g. NOVA"
                  autoFocus
                  maxLength={20}
                  className="w-full bg-white/5 border border-purple-500/40 rounded-xl px-4 py-3 text-base font-mono font-bold text-white tracking-widest placeholder-slate-600 focus:outline-none focus:border-purple-400 uppercase"
                />
                <div className="flex items-center gap-2">
                  <GlassButton variant="primary" size="sm" onClick={handleSave} icon={FiCheck}>
                    Save Wake Word
                  </GlassButton>
                  <GlassButton variant="ghost" size="sm" onClick={() => setEditMode(false)}>
                    Cancel
                  </GlassButton>
                </div>
              </div>
            )}
          </div>

          {/* Quick preset words */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_WORDS.map((word) => (
                <button
                  key={word}
                  onClick={() => handlePreset(word)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all border ${
                    wakeWord === word
                      ? 'bg-purple-600/25 text-purple-300 border-purple-500/40'
                      : 'bg-white/5 text-slate-400 border-white/8 hover:bg-white/10 hover:text-white hover:border-white/15'
                  }`}
                >
                  {word}
                  {wakeWord === word && <span className="ml-2 text-purple-400">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Test button */}
          <div className="pt-2 border-t border-white/6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Test Voice Navigation</p>
              <p className="text-xs text-slate-400 mt-0.5">Open the voice modal manually and say “Open Expenses” or “Show Analytics”</p>
            </div>
            <GlassButton variant="glass" size="sm" icon={FiZap} onClick={() => activateVoiceMode()}>
              Test Now
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* ── SUPPORTED VOICE NAVIGATION COMMANDS CARD ─────────────────────── */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <FiCompass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Supported Voice Navigation Commands</h3>
            <p className="text-xs text-slate-400 mt-0.5">Speak any of these natural commands after saying <span className="text-purple-300 font-bold">"{wakeWord}"</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUPPORTED_COMMANDS.map((cmd) => (
            <div
              key={cmd.destination}
              className="p-4 rounded-2xl bg-white/4 border border-white/6 space-y-2 hover:border-purple-500/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  {cmd.destination}
                </span>
                <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                  {cmd.path}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cmd.phrases.map((phrase) => (
                  <span
                    key={phrase}
                    className="text-[11px] text-slate-300 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 font-mono"
                  >
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── HOW IT WORKS CARD ────────────────────────────────────────────── */}
      <GlassCard>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FiZap className="text-purple-400 w-4 h-4" /> Voice Navigation Flow
        </h3>
        <ol className="space-y-3">
          {[
            { step: '01', title: 'Wake Word', text: `Say "${wakeWord}" (or click the microphone icon).`, color: '#a78bfa' },
            { step: '02', title: 'Voice Mode Activates', text: 'The liquid glass listening popup appears with glowing waveform.', color: '#67e8f9' },
            { step: '03', title: 'Speak Command', text: 'Say "Open Expenses", "Show Analytics", "Go to Calendar", or "Go Back".', color: '#34d399' },
            { step: '04', title: 'Voice & Visual Feedback', text: 'Assistant confirms ("Opening Expenses.") and instantly navigates to the page.', color: '#f9a8d4' },
          ].map(({ step, title, text, color }) => (
            <li key={step} className="flex items-start gap-3">
              <span
                className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold"
                style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
              >
                {step}
              </span>
              <div>
                <p className="text-xs font-bold text-white">{title}</p>
                <p className="text-xs text-slate-300 mt-0.5">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </GlassCard>
    </div>
  );
};

export default SettingsPage;
