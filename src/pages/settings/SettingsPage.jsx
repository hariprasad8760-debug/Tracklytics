/**
 * ============================================================================
 * FILE: src/pages/settings/SettingsPage.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Provides the Settings hub for the application. Currently contains the
 *   Voice Assistant configuration section for changing the wake word.
 *   Designed to be extended later with profile settings, theme, notifications, etc.
 * ============================================================================
 */

import React, { useState } from 'react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import { useVoice } from '../../context/VoiceContext';
import {
  FiMic, FiMicOff, FiCheck, FiEdit2, FiAlertCircle, FiZap
} from 'react-icons/fi';

const PRESET_WORDS = ['MAPLA', 'TRACKLYTICS', 'ZENO', 'NOVA', 'HEY TRACK'];

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
            <h3 className="text-base font-bold text-white">Voice Assistant</h3>
            <p className="text-xs text-slate-400 mt-0.5">Wake word detection and voice activation settings</p>
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
                Continuously listen for <span className="text-purple-400 font-bold">"{wakeWord}"</span> to activate voice mode
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
                  Change
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
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
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
              <p className="text-sm font-semibold text-white">Test Voice Assistant</p>
              <p className="text-xs text-slate-400 mt-0.5">Open the voice popup manually to preview the interface</p>
            </div>
            <GlassButton variant="glass" size="sm" icon={FiZap} onClick={activateVoiceMode}>
              Test Now
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* How it works */}
      <GlassCard>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FiZap className="text-purple-400 w-4 h-4" /> How Voice Activation Works
        </h3>
        <ol className="space-y-3">
          {[
            { step: '01', text: `Say "${wakeWord}" clearly while the app is open.`, color: '#a78bfa' },
            { step: '02', text: 'Voice Mode activates and the listening popup appears.', color: '#67e8f9' },
            { step: '03', text: 'Speak naturally — your words appear in real time.', color: '#34d399' },
            { step: '04', text: 'Say "Stop" or click Close when you\'re done.', color: '#f9a8d4' },
          ].map(({ step, text, color }) => (
            <li key={step} className="flex items-start gap-3">
              <span
                className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold"
                style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
              >
                {step}
              </span>
              <p className="text-sm text-slate-300 mt-1">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 pt-4 border-t border-white/6 text-xs text-slate-500">
          Voice commands for adding expenses, logging study sessions, and AI analytics will be connected in the next update.
        </p>
      </GlassCard>
    </div>
  );
};

export default SettingsPage;
