/**
 * ============================================================================
 * FILE: src/components/voice/VoicePopup.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Persistent Water Glass / Aurora Voice Assistant Conversation Indicator.
 *
 * FEATURES:
 *   - Continuous conversation state badges (LISTENING / PROCESSING / SPEAKING).
 *   - Live audio waveform and glowing state microphone.
 *   - Assistant reply bubble with multi-turn dialog tracking.
 *   - Real-time recognized user speech preview.
 *   - Visible [ End Conversation ] button and quick suggestion pills.
 * ============================================================================
 */

import React from 'react';
import {
  FiMic,
  FiMicOff,
  FiX,
  FiSquare,
  FiCompass,
  FiArrowRight,
  FiClock,
  FiVolume2,
  FiZap,
  FiHelpCircle
} from 'react-icons/fi';
import { useVoice } from '../../context/VoiceContext';

// Live Dynamic 14-Bar Equalizer
const ConversationalWaveform = ({ state }) => {
  const isListening = state === 'LISTENING';
  const isSpeaking = state === 'ASSISTANT_RESPONDING';
  const isProcessing = state === 'PROCESSING';

  return (
    <div className="flex items-center gap-[3px] h-7 px-1" aria-hidden="true">
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className="w-[2.5px] rounded-full transition-all duration-200"
          style={{
            background: isSpeaking
              ? 'linear-gradient(180deg, #34d399, #06b6d4)'
              : isProcessing
                ? 'linear-gradient(180deg, #f59e0b, #ef4444)'
                : 'linear-gradient(180deg, #06b6d4, #a855f7, #ec4899)',
            height: isListening
              ? `${Math.max(6, (Math.sin(i * 0.7) + 1) * 11 + 4)}px`
              : isSpeaking
                ? `${Math.max(8, (Math.cos(i * 0.9) + 1) * 10 + 6)}px`
                : isProcessing
                  ? '6px'
                  : '4px',
            animation: (isListening || isSpeaking)
              ? `wavePulse ${0.45 + (i % 6) * 0.1}s ease-in-out infinite alternate`
              : 'none',
            opacity: (isListening || isSpeaking) ? 0.95 : 0.35,
          }}
        />
      ))}
      <style>{`
        @keyframes wavePulse {
          0%   { height: 5px; opacity: 0.4; }
          100% { height: 26px; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export const VoicePopup = () => {
  const {
    isVoiceModeActive,
    conversationState,
    transcript,
    lastAssistantMessage,
    activeFlow,
    wakeWord,
    micPermission,
    deactivateVoiceMode,
    triggerCommand,
  } = useVoice();

  if (!isVoiceModeActive) return null;

  const isDenied = micPermission === 'denied';
  const isListening = conversationState === 'LISTENING';
  const isProcessing = conversationState === 'PROCESSING';
  const isSpeaking = conversationState === 'ASSISTANT_RESPONDING';

  // Manual suggestion chip trigger
  const handleQuickChip = (phrase) => {
    triggerCommand(phrase);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[95vw] max-w-2xl px-2 animate-in slide-in-from-top-6 fade-in duration-300 pointer-events-auto">
      {/* ── Aurora Water-Glass Persistent Capsule ────────────────────────── */}
      <div
        className="relative rounded-3xl p-4 sm:p-5 border shadow-2xl backdrop-blur-2xl transition-all duration-300 overflow-hidden"
        style={{
          background: isSpeaking
            ? 'linear-gradient(135deg, rgba(8, 38, 30, 0.96) 0%, rgba(10, 22, 20, 0.98) 100%)'
            : isProcessing
              ? 'linear-gradient(135deg, rgba(42, 20, 14, 0.96) 0%, rgba(18, 10, 12, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(16, 12, 40, 0.96) 0%, rgba(8, 6, 26, 0.98) 100%)',
          borderColor: isSpeaking
            ? 'rgba(52, 211, 153, 0.5)'
            : isProcessing
              ? 'rgba(245, 158, 11, 0.5)'
              : 'rgba(168, 85, 247, 0.5)',
          boxShadow: isSpeaking
            ? '0 15px 50px rgba(52, 211, 153, 0.25), 0 0 35px rgba(52, 211, 153, 0.15)'
            : '0 18px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(168, 85, 247, 0.25)',
        }}
      >
        {/* Ambient Top Glow Aura */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-4/5 h-24 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{
            background: isSpeaking
              ? 'radial-gradient(circle, #34d399 0%, transparent 70%)'
              : isProcessing
                ? 'radial-gradient(circle, #f59e0b 0%, transparent 70%)'
                : 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
          }}
        />

        {/* ── Row 1: Header with State Badge & End Conversation Button ───── */}
        <div className="flex items-center justify-between gap-3 relative z-10 mb-3">
          
          {/* Left: Status Badge */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-3 h-3 rounded-full transition-all"
              style={{
                background: isSpeaking
                  ? '#34d399'
                  : isProcessing
                    ? '#f59e0b'
                    : isListening
                      ? '#ec4899'
                      : '#94a3b8',
                boxShadow: isListening ? '0 0 10px #ec4899' : 'none',
                animation: isListening ? 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none',
              }}
            />
            <span className="text-xs font-extrabold tracking-wider uppercase text-white flex items-center gap-1.5 font-mono">
              <span>Voice Assistant</span>
              <span className="text-slate-400 font-normal">·</span>
              <span
                className={
                  isSpeaking
                    ? 'text-emerald-300 font-bold'
                    : isProcessing
                      ? 'text-amber-300 font-bold'
                      : 'text-purple-300'
                }
              >
                {isSpeaking
                  ? 'Speaking…'
                  : isProcessing
                    ? 'Processing…'
                    : isListening
                      ? 'Listening…'
                      : 'Idle'}
              </span>
            </span>

            {/* Active Multi-Turn Flow Tag */}
            {activeFlow && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-200 border border-purple-400/30">
                {activeFlow.type === 'ADD_EXPENSE'
                  ? '💸 Adding Expense'
                  : activeFlow.type === 'ADD_STUDY'
                    ? '📚 Logging Study'
                    : 'Active Conversation'}
              </span>
            )}
          </div>

          {/* Right: End Conversation Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={deactivateVoiceMode}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-200 transition-all hover:text-white group shadow-sm"
              title="End Voice Conversation (or say 'Stop listening')"
            >
              <FiSquare className="w-3 h-3 text-rose-400 group-hover:scale-110 transition-transform" />
              <span>End Conversation</span>
            </button>
            <button
              onClick={deactivateVoiceMode}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Row 2: Visualizer & Dialog Content Stream ────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center relative z-10 bg-black/30 rounded-2xl p-3.5 border border-white/10">
          
          {/* Animated Microphone Icon */}
          <div className="md:col-span-2 flex items-center justify-center md:justify-start gap-2">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center border shadow-lg transition-all"
              style={{
                background: isDenied
                  ? 'rgba(239, 68, 68, 0.2)'
                  : isSpeaking
                    ? 'linear-gradient(135deg, #059669, #34d399)'
                    : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                borderColor: isSpeaking ? '#34d399' : '#c084fc',
              }}
            >
              {isDenied ? (
                <FiMicOff className="w-5 h-5 text-rose-400" />
              ) : isSpeaking ? (
                <FiVolume2 className="w-5 h-5 text-white animate-pulse" />
              ) : (
                <FiMic className="w-5 h-5 text-white animate-bounce" />
              )}
            </div>
            <ConversationalWaveform state={conversationState} />
          </div>

          {/* Assistant's Response Bubble + Live User Speech */}
          <div className="md:col-span-10 space-y-1.5">
            
            {/* Assistant Speech Bubble */}
            <div className="flex items-start gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300 shrink-0 pt-0.5">
                Assistant:
              </span>
              <p className="text-sm font-semibold text-white leading-snug">
                {lastAssistantMessage || "I'm listening."}
              </p>
            </div>

            {/* Live Recognized User Speech Text */}
            <div className="flex items-start gap-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 pt-0.5">
                You:
              </span>
              <div className="text-purple-200 font-medium italic min-h-[18px]">
                {transcript ? (
                  <span className="bg-purple-500/20 px-2 py-0.5 rounded-md border border-purple-500/30 not-italic text-white">
                    “{transcript}”
                  </span>
                ) : (
                  <span className="text-slate-500 not-italic">
                    {isListening ? 'Speak naturally… e.g. “Add expense”, “500”, “Food”, “Open study”' : '…'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 3: Quick Conversational Action Pills ─────────────────────── */}
        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 shrink-0">
            <FiZap className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">Try Saying:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: '“Add expense”', text: 'Add expense' },
              { label: '“Show expenses”', text: 'Show my expenses' },
              { label: '“Open study”', text: 'Open study' },
              { label: '“Show analytics”', text: 'Show analytics' },
              { label: '“Open calendar”', text: 'Open calendar' },
              { label: '“Help”', text: 'Help' },
              { label: '“Stop listening”', text: 'Stop listening' },
            ].map((pill) => (
              <button
                key={pill.label}
                onClick={() => handleQuickChip(pill.text)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-white border border-white/10 hover:border-purple-400/40 transition-all flex items-center gap-1"
              >
                <span>{pill.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoicePopup;
