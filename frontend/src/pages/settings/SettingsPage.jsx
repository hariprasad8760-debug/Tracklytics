/**
 * ============================================================================
 * FILE: src/pages/settings/SettingsPage.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Settings configuration center for Tracklytics Continuous Conversational Voice Assistant:
 *     - Wake Word customization (default: "MAPLA")
 *     - Continuous Conversation Mode toggle (ON / OFF)
 *     - Inactivity Timeout selector (30s, 45s, 60s, 90s, 120s)
 *     - Assistant Voice Persona selection (Female, Male, Natural Assistant)
 *     - Wake Word Detection toggle (ON / OFF)
 *     - Full interactive reference of supported conversational commands
 * ============================================================================
 */

import React, { useState } from 'react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import { useVoice } from '../../context/VoiceContext';
import {
  FiMic,
  FiCheck,
  FiEdit2,
  FiAlertCircle,
  FiZap,
  FiCompass,
  FiClock,
  FiVolume2,
  FiRepeat,
  FiMessageSquare
} from 'react-icons/fi';

const PRESET_WORDS = ['MAPLA', 'TRACKLYTICS', 'ZENO', 'NOVA', 'HEY TRACK'];

const CONVERSATION_EXAMPLES = [
  {
    category: 'Expense Dialog (Multi-Turn)',
    flow: [
      { speaker: 'You', text: '“Add expense”' },
      { speaker: 'Assistant', text: '“Sure. What is the amount?”' },
      { speaker: 'You', text: '“500”' },
      { speaker: 'Assistant', text: '“What was it for?”' },
      { speaker: 'You', text: '“Food”' },
      { speaker: 'Assistant', text: '“Got it. $500 food expense.” → Keeps listening' },
    ],
  },
  {
    category: 'Study Tracker Dialog (Multi-Turn)',
    flow: [
      { speaker: 'You', text: '“Log study”' },
      { speaker: 'Assistant', text: '“Sure. Which subject did you study?”' },
      { speaker: 'You', text: '“Spring Boot”' },
      { speaker: 'Assistant', text: '“How many hours did you study?”' },
      { speaker: 'You', text: '“2 hours”' },
      { speaker: 'Assistant', text: '“Logged 2 hours for Spring Boot.” → Keeps listening' },
    ],
  },
  {
    category: 'Instant Navigation & Exit',
    flow: [
      { speaker: 'You', text: '“Show my expenses”' },
      { speaker: 'Assistant', text: '“Opening your expenses.” → Navigates & keeps listening' },
      { speaker: 'You', text: '“Open study”' },
      { speaker: 'Assistant', text: '“Opening your study dashboard.” → Keeps listening' },
      { speaker: 'You', text: '“Stop listening”' },
      { speaker: 'Assistant', text: '“Ending conversation. Goodbye!” → Returns to idle' },
    ],
  },
];

export const SettingsPage = () => {
  const {
    wakeWord,
    wakeWordEnabled,
    continuousMode,
    inactivityTimeoutSec,
    assistantVoice,
    micPermission,
    updateWakeWord,
    toggleWakeWordEnabled,
    updateContinuousMode,
    updateInactivityTimeoutSec,
    updateAssistantVoice,
    activateVoiceMode,
  } = useVoice();

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(wakeWord);
  const [savedToast, setSavedToast] = useState('');

  const triggerToast = (msg) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(''), 2500);
  };

  const handleSaveWakeWord = () => {
    if (!draft.trim()) return;
    updateWakeWord(draft.trim());
    setEditMode(false);
    triggerToast('Wake Word updated!');
  };

  const handlePreset = (word) => {
    updateWakeWord(word);
    setDraft(word);
    setEditMode(false);
    triggerToast(`Wake word set to "${word}"`);
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-900/95 border border-purple-500/50 text-white text-sm shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5">
          <FiCheck className="text-emerald-400 w-4 h-4" />
          <span>{savedToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Configure your Tracklytics voice assistant and system preferences</p>
      </div>

      {/* ── VOICE ASSISTANT SETTINGS CARD ────────────────────────────────── */}
      <GlassCard className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <FiMic className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Voice Assistant & Conversation Mode</h3>
              <p className="text-xs text-slate-400 mt-0.5">Continuous speech recognition, wake word detection, and dialog settings</p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              wakeWordEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${wakeWordEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
            {wakeWordEnabled ? 'Wake Word Active' : 'Disabled'}
          </span>
        </div>

        {/* Mic Permission Warning */}
        {micPermission === 'denied' && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
            <FiAlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-rose-400">Microphone Access Denied</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Please allow microphone permission in your browser URL bar to enable continuous voice conversation.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-5">
          {/* 1. Wake Word Option */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Wake Word</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Say this keyword once to activate Continuous Conversation Mode
                </p>
              </div>

              {!editMode && (
                <button
                  onClick={() => { setEditMode(true); setDraft(wakeWord); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/15 border border-purple-400/30 hover:bg-purple-500/25 transition-all"
                >
                  <FiEdit2 className="w-3 h-3" />
                  Change
                </button>
              )}
            </div>

            {!editMode ? (
              <div className="flex items-center gap-3">
                <div
                  className="px-5 py-2.5 rounded-2xl font-mono font-black text-lg tracking-[0.2em] text-white"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(109,40,217,0.15))',
                    border: '1.5px solid rgba(168,85,247,0.4)',
                    boxShadow: '0 0 25px rgba(168,85,247,0.15)',
                  }}
                >
                  {wakeWord}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveWakeWord();
                    if (e.key === 'Escape') setEditMode(false);
                  }}
                  placeholder="e.g. MAPLA"
                  autoFocus
                  maxLength={20}
                  className="w-full bg-slate-900 border border-purple-500/50 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white tracking-widest focus:outline-none focus:border-purple-400 uppercase"
                />
                <div className="flex items-center gap-2">
                  <GlassButton variant="primary" size="sm" onClick={handleSaveWakeWord} icon={FiCheck}>
                    Save Wake Word
                  </GlassButton>
                  <GlassButton variant="ghost" size="sm" onClick={() => setEditMode(false)}>
                    Cancel
                  </GlassButton>
                </div>
              </div>
            )}

            {/* Quick Presets */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Quick Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_WORDS.map((w) => (
                  <button
                    key={w}
                    onClick={() => handlePreset(w)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold tracking-wider transition-all border ${
                      wakeWord === w
                        ? 'bg-purple-600/30 text-purple-300 border-purple-400'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Continuous Conversation Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <FiRepeat className="text-purple-400 w-4 h-4" />
                <p className="text-sm font-bold text-white">Continuous Conversation</p>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Keep listening for follow-up commands without saying "{wakeWord}" again after each response
              </p>
            </div>

            <button
              onClick={() => {
                const next = !continuousMode;
                updateContinuousMode(next);
                triggerToast(next ? 'Continuous Conversation Enabled (ON)' : 'Continuous Conversation Disabled (OFF)');
              }}
              className="relative inline-flex w-12 h-6 rounded-full transition-colors duration-300 shrink-0 ml-4"
              style={{
                background: continuousMode
                  ? 'linear-gradient(90deg, #7c3aed, #6d28d9)'
                  : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              role="switch"
              aria-checked={continuousMode}
            >
              <span
                className="inline-block w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 mt-0.5"
                style={{ transform: continuousMode ? 'translateX(24px)' : 'translateX(2px)' }}
              />
            </button>
          </div>

          {/* 3. Inactivity Timeout Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <FiClock className="text-purple-400 w-4 h-4" />
                <p className="text-sm font-bold text-white">Inactivity Timeout</p>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Time before asking "Are you still there?" and closing session if no speech detected
              </p>
            </div>

            <select
              value={inactivityTimeoutSec}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateInactivityTimeoutSec(val);
                triggerToast(`Inactivity timeout set to ${val} seconds`);
              }}
              className="bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2 text-xs font-bold text-purple-300 focus:outline-none focus:border-purple-500 font-mono shrink-0"
            >
              <option value={30}>30 seconds</option>
              <option value={45}>45 seconds</option>
              <option value={60}>60 seconds (Recommended)</option>
              <option value={90}>90 seconds</option>
              <option value={120}>120 seconds</option>
            </select>
          </div>

          {/* 4. Assistant Voice Persona */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <FiVolume2 className="text-purple-400 w-4 h-4" />
                <p className="text-sm font-bold text-white">Assistant Voice</p>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Select your preferred voice tone and speech synthesis profile
              </p>
            </div>

            <select
              value={assistantVoice}
              onChange={(e) => {
                const val = e.target.value;
                updateAssistantVoice(val);
                triggerToast(`Assistant voice set to ${val}`);
              }}
              className="bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500 shrink-0"
            >
              <option value="female">Natural Female Voice</option>
              <option value="male">Natural Male Voice</option>
              <option value="natural">High-Fidelity Neural Assistant</option>
            </select>
          </div>

          {/* 5. Wake Word Detection Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div>
              <p className="text-sm font-bold text-white">Wake Word Detection</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Background listener for automatic hands-free activation
              </p>
            </div>

            <button
              onClick={() => {
                const next = !wakeWordEnabled;
                toggleWakeWordEnabled(next);
                triggerToast(next ? 'Wake Word Detection Enabled (ON)' : 'Wake Word Detection Disabled (OFF)');
              }}
              className="relative inline-flex w-12 h-6 rounded-full transition-colors duration-300 shrink-0 ml-4"
              style={{
                background: wakeWordEnabled
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              role="switch"
              aria-checked={wakeWordEnabled}
            >
              <span
                className="inline-block w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 mt-0.5"
                style={{ transform: wakeWordEnabled ? 'translateX(24px)' : 'translateX(2px)' }}
              />
            </button>
          </div>

          {/* Test Conversation Button */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Test Conversation Mode</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Launch the assistant indicator and test continuous multi-turn dialogue
              </p>
            </div>
            <GlassButton
              variant="primary"
              size="sm"
              icon={FiZap}
              onClick={() => activateVoiceMode('', "I'm listening.")}
            >
              Start Conversation
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* ── CONVERSATION FLOW GUIDE ──────────────────────────────────────── */}
      <GlassCard className="space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <FiMessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Continuous Conversation Examples</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Say <span className="text-purple-300 font-bold">"{wakeWord}"</span> once, then talk naturally
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {CONVERSATION_EXAMPLES.map((ex) => (
            <div
              key={ex.category}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3"
            >
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
                {ex.category}
              </h4>
              <div className="space-y-2 text-xs">
                {ex.flow.map((turn, i) => (
                  <div key={i} className="flex items-start gap-1.5 leading-relaxed">
                    <span
                      className={`font-bold text-[11px] shrink-0 ${
                        turn.speaker === 'You' ? 'text-cyan-300' : 'text-purple-300'
                      }`}
                    >
                      {turn.speaker}:
                    </span>
                    <span className="text-slate-300">{turn.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default SettingsPage;
