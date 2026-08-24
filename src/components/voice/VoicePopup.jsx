/**
 * ============================================================================
 * FILE: src/components/voice/VoicePopup.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Sleek Floating Dynamic Island Voice Bar for Tracklytics.
 *
 * DESIGN HIGHLIGHTS:
 *   - Non-blocking top-center floating sound capsule (HUD Dynamic Island).
 *   - Live multi-color gradient audio visualizer & live transcription stream.
 *   - Automatic 2.60s silence command processing with natural speech confirmation.
 *   - Instant destination chips & one-tap manual execute button.
 *   - Close via "exit", "close", "stop", Esc key, or click.
 * ============================================================================
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMic,
  FiMicOff,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiCompass,
  FiArrowRight,
  FiClock,
  FiZap
} from 'react-icons/fi';
import { useVoice } from '../../context/VoiceContext';
import { parseVoiceIntent, speakVoiceFeedback } from '../../services/voiceIntentService';

// Exactly 2.60 seconds of silence before executing command
const SILENCE_TIMEOUT_MS = 2600;

// Exit keywords
const EXIT_WORDS = ['exit', 'close', 'stop', 'quit', 'goodbye', 'bye', 'dismiss', 'cancel'];

function isExitCommand(text) {
  if (!text) return false;
  const t = text.toLowerCase().trim();
  return EXIT_WORDS.some((w) => t === w || t.includes(w));
}

// Mini 16-bar Dynamic Equalizer
const MiniAudioVisualizer = ({ isListening, isSuccess }) => {
  return (
    <div className="flex items-center gap-[2.5px] h-6 px-1" aria-hidden="true">
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="w-[2.5px] rounded-full transition-all"
          style={{
            background: isSuccess
              ? 'linear-gradient(180deg, #34d399, #10b981)'
              : 'linear-gradient(180deg, #06b6d4, #a855f7, #ec4899)',
            height: isListening ? `${Math.max(6, (Math.sin(i * 0.8) + 1) * 10 + 4)}px` : '4px',
            animation: isListening
              ? `audioBarPulse ${0.5 + (i % 5) * 0.12}s ease-in-out infinite alternate`
              : 'none',
            opacity: isListening ? 0.9 : 0.3,
          }}
        />
      ))}
      <style>{`
        @keyframes audioBarPulse {
          0%   { height: 4px; opacity: 0.4; }
          100% { height: 22px; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export const VoicePopup = () => {
  const navigate = useNavigate();
  const {
    isVoiceModeActive,
    isListening,
    transcript,
    micPermission,
    wakeWord,
    deactivateVoiceMode,
    setIsListening,
    updateTranscript,
  } = useVoice();

  const [commandStatus, setCommandStatus] = useState(null); // null | { type: 'success'|'error', text: string }
  const [isEvaluating, setIsEvaluating] = useState(false);

  const executionLockRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const currentTranscriptRef = useRef(transcript);
  currentTranscriptRef.current = transcript;

  // Clear timer helper
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Reset to active listening loop
  const resetToListening = useCallback(() => {
    clearSilenceTimer();
    setCommandStatus(null);
    setIsEvaluating(false);
    executionLockRef.current = false;
    updateTranscript('');
    setIsListening(true);
  }, [clearSilenceTimer, updateTranscript, setIsListening]);

  // Execute spoken navigation command
  const executeCommand = useCallback(
    (textToParse) => {
      if (executionLockRef.current || !textToParse?.trim()) return;

      // Handle exit command
      if (isExitCommand(textToParse)) {
        executionLockRef.current = true;
        clearSilenceTimer();
        speakVoiceFeedback('Closing voice assistant.');
        setTimeout(() => deactivateVoiceMode(), 700);
        return;
      }

      const intent = parseVoiceIntent(textToParse, wakeWord);

      if (intent.type === 'NAVIGATE') {
        executionLockRef.current = true;
        clearSilenceTimer();
        setIsListening(false);
        setIsEvaluating(false);

        setCommandStatus({ type: 'success', text: intent.feedback });
        speakVoiceFeedback(intent.feedback);

        setTimeout(() => {
          if (intent.target === 'BACK') navigate(-1);
          else navigate(intent.target);

          // Smoothly close after navigation completes
          setTimeout(() => {
            deactivateVoiceMode();
          }, 650);
        }, 600);
      } else {
        // Unknown command -> prompt user and reset to keep listening
        clearSilenceTimer();
        setIsEvaluating(false);
        setCommandStatus({
          type: 'error',
          text: "Command not recognized. Say 'Expenses', 'Study', or 'Exit'.",
        });
        speakVoiceFeedback("I didn't understand that command. Please try again.");

        setTimeout(() => resetToListening(), 2600);
      }
    },
    [wakeWord, navigate, deactivateVoiceMode, setIsListening, clearSilenceTimer, resetToListening]
  );

  // Reset state on open/close
  useEffect(() => {
    if (isVoiceModeActive) {
      setCommandStatus(null);
      setIsEvaluating(false);
      executionLockRef.current = false;

      // Check if user spoke command in same breath as wake word
      if (transcript?.trim()) {
        const direct = parseVoiceIntent(transcript, wakeWord);
        if (direct.type === 'NAVIGATE') executeCommand(transcript);
      }
    } else {
      setCommandStatus(null);
      setIsEvaluating(false);
      executionLockRef.current = false;
      clearSilenceTimer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVoiceModeActive]);

  // 2.60s Silence Timeout Handler
  useEffect(() => {
    if (!isVoiceModeActive || executionLockRef.current || !transcript?.trim()) {
      setIsEvaluating(false);
      return;
    }

    clearSilenceTimer();
    setIsEvaluating(true);

    silenceTimerRef.current = setTimeout(() => {
      if (isVoiceModeActive && !executionLockRef.current && currentTranscriptRef.current?.trim()) {
        executeCommand(currentTranscriptRef.current);
      }
    }, SILENCE_TIMEOUT_MS);

    return () => clearSilenceTimer();
  }, [transcript, isVoiceModeActive, executeCommand, clearSilenceTimer]);

  // Escape key closes voice bar
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') deactivateVoiceMode();
    };
    if (isVoiceModeActive) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isVoiceModeActive, deactivateVoiceMode]);

  if (!isVoiceModeActive) return null;

  const isDenied = micPermission === 'denied';
  const isSuccess = commandStatus?.type === 'success';
  const isError = commandStatus?.type === 'error';

  // Manual Quick Destination Chip Click
  const handleChipClick = (path, feedback) => {
    if (executionLockRef.current) return;
    executionLockRef.current = true;
    clearSilenceTimer();
    setIsListening(false);
    setIsEvaluating(false);
    setCommandStatus({ type: 'success', text: feedback });
    speakVoiceFeedback(feedback);

    setTimeout(() => {
      if (path === 'BACK') navigate(-1);
      else navigate(path);
      setTimeout(() => deactivateVoiceMode(), 650);
    }, 600);
  };

  // Immediate execute button
  const handleExecuteNow = () => {
    clearSilenceTimer();
    setIsListening(false);
    setIsEvaluating(false);
    if (transcript?.trim()) executeCommand(transcript);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[95vw] max-w-2xl px-2 animate-in slide-in-from-top-6 fade-in duration-300 pointer-events-auto">
      {/* ── Floating Dynamic Sound Capsule ──────────────────────────────── */}
      <div
        className="relative rounded-3xl p-4 sm:p-5 border shadow-2xl backdrop-blur-2xl transition-all duration-300 overflow-hidden"
        style={{
          background: isSuccess
            ? 'linear-gradient(135deg, rgba(6, 44, 30, 0.95) 0%, rgba(10, 20, 16, 0.98) 100%)'
            : isError
              ? 'linear-gradient(135deg, rgba(50, 14, 24, 0.95) 0%, rgba(18, 8, 14, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(16, 12, 38, 0.94) 0%, rgba(8, 6, 22, 0.98) 100%)',
          borderColor: isSuccess
            ? 'rgba(52, 211, 153, 0.5)'
            : isError
              ? 'rgba(244, 63, 94, 0.5)'
              : 'rgba(168, 85, 247, 0.45)',
          boxShadow: isSuccess
            ? '0 10px 40px rgba(52, 211, 153, 0.25), 0 0 0 1px rgba(52, 211, 153, 0.3)'
            : '0 15px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(168, 85, 247, 0.25)',
        }}
      >
        {/* Subtle Ambient Light Bar */}
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 h-20 rounded-full blur-2xl pointer-events-none opacity-40"
          style={{
            background: isSuccess
              ? 'radial-gradient(circle, #34d399 0%, transparent 70%)'
              : isError
                ? 'radial-gradient(circle, #f43f5e 0%, transparent 70%)'
                : 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
          }}
        />

        {/* ── Main Dynamic Island Row ──────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          
          {/* Left: Glowing Mic / Status Beacon */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center border shadow-lg transition-all duration-300"
              style={{
                background: isDenied
                  ? 'rgba(239, 68, 68, 0.2)'
                  : isSuccess
                    ? 'linear-gradient(135deg, #34d399, #059669)'
                    : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                borderColor: isSuccess ? 'rgba(52, 211, 153, 0.6)' : 'rgba(192, 132, 252, 0.5)',
                boxShadow: isSuccess
                  ? '0 0 20px rgba(52, 211, 153, 0.5)'
                  : '0 0 20px rgba(168, 85, 247, 0.4)',
              }}
            >
              {isDenied ? (
                <FiMicOff className="w-5 h-5 text-rose-300" />
              ) : isSuccess ? (
                <FiCheckCircle className="w-5 h-5 text-white animate-in zoom-in-50" />
              ) : isError ? (
                <FiAlertCircle className="w-5 h-5 text-rose-300" />
              ) : (
                <FiMic className="w-5 h-5 text-white animate-pulse" />
              )}
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Voice Assistant
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSuccess ? 'bg-emerald-400' : 'bg-purple-400 animate-ping'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-400">Wake word: “{wakeWord}”</p>
            </div>
          </div>

          {/* Center: Live Speech Stream & Visualizer */}
          <div className="flex-1 min-w-0 px-2 sm:px-4">
            <div className="flex items-center gap-2 mb-1">
              <MiniAudioVisualizer isListening={isListening && !isSuccess} isSuccess={isSuccess} />

              <span className="text-xs font-mono font-medium">
                {isSuccess ? (
                  <span className="text-emerald-300 font-bold">{commandStatus.text}</span>
                ) : isError ? (
                  <span className="text-rose-300">{commandStatus.text}</span>
                ) : isEvaluating ? (
                  <span className="text-purple-300 font-bold animate-pulse flex items-center gap-1">
                    <FiClock className="w-3 h-3 text-purple-400" /> Processing in 2.6s…
                  </span>
                ) : isListening ? (
                  <span className="text-slate-300">Listening for command…</span>
                ) : (
                  <span className="text-slate-400">Ready</span>
                )}
              </span>
            </div>

            {/* Live Spoken Words Typographic Display */}
            <div className="truncate text-sm font-semibold text-white">
              {transcript ? (
                <span className="text-purple-200 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                  “{transcript}”
                </span>
              ) : (
                <span className="text-xs text-slate-500 font-normal italic">
                  Say “Open Expenses”, “Go to Study”, “Show Analytics”, or “Exit”…
                </span>
              )}
            </div>
          </div>

          {/* Right: Quick Action & Close Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isListening && transcript?.trim() && !isSuccess && (
              <button
                onClick={handleExecuteNow}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500 hover:bg-purple-400 text-white shadow-lg shadow-purple-900/50 transition-all"
                title="Execute spoken command now"
              >
                <FiZap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Execute</span>
              </button>
            )}

            <button
              onClick={deactivateVoiceMode}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 transition-colors"
              aria-label="Close Voice Assistant"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Bottom Quick Navigation Shortcut Chips ──────────────────────── */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 shrink-0">
            <FiCompass className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">Jump to:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: 'Dashboard', path: '/', voice: 'Opening Dashboard.' },
              { label: 'Expenses', path: '/expense', voice: 'Opening Expenses.' },
              { label: 'Study', path: '/study', voice: 'Opening Study Tracker.' },
              { label: 'Analytics', path: '/analytics', voice: 'Opening Analytics.' },
              { label: 'Calendar', path: '/calendar', voice: 'Opening Calendar.' },
              { label: 'Back', path: 'BACK', voice: 'Going back.' },
            ].map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleChipClick(chip.path, chip.voice)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-white border border-white/10 hover:border-purple-400/40 transition-all flex items-center gap-1"
              >
                <span>{chip.label}</span>
                <FiArrowRight className="w-2.5 h-2.5 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoicePopup;
