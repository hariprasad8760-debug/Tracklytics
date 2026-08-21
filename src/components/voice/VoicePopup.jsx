/**
 * ============================================================================
 * FILE: src/components/voice/VoicePopup.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   High-speed Voice Assistant popup modal that displays in the center of the screen
 *   whenever voice mode is activated (either by wake word "MAPLA" or mic button).
 *
 * RESPONSIVENESS & TIMING:
 *   - Fast wake-word activation (< 1s)
 *   - Waits exactly 1.50 seconds (1500ms) after user stops speaking before executing action
 *   - Supports all command variations (e.g. "go to study block", "open expense slot", "analytics")
 *   - Automatic React Router page navigation
 *   - Natural Text-to-Speech voice confirmation
 * ============================================================================
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiMic, 
  FiMicOff, 
  FiX, 
  FiSquare, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiCompass, 
  FiArrowRight,
  FiClock
} from 'react-icons/fi';
import { useVoice } from '../../context/VoiceContext';
import WaveformAnimation from './WaveformAnimation';
import { parseVoiceIntent, speakVoiceFeedback } from '../../services/voiceIntentService';

const SILENCE_TIMEOUT_MS = 2600; // Exactly 2.60 seconds after user stops speaking

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
  } = useVoice();

  const transcriptRef = useRef(null);
  const [commandStatus, setCommandStatus] = useState(null); // null | { type: 'success'|'error', text: string, target?: string }
  const [isEvaluating, setIsEvaluating] = useState(false);
  const executionLockRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const currentTranscriptRef = useRef(transcript);
  currentTranscriptRef.current = transcript;

  // Execute the parsed navigation command
  const executeCommand = useCallback((textToParse) => {
    if (executionLockRef.current || !textToParse || !textToParse.trim()) {
      return;
    }

    const intent = parseVoiceIntent(textToParse, wakeWord);

    if (intent.type === 'NAVIGATE') {
      executionLockRef.current = true;
      setIsListening(false);
      setIsEvaluating(false);

      setCommandStatus({
        type: 'success',
        text: intent.feedback,
        label: intent.label,
        target: intent.target,
      });

      // 1. Voice audio feedback output
      speakVoiceFeedback(intent.feedback);

      // 2. Perform page navigation
      const navTimer = setTimeout(() => {
        if (intent.target === 'BACK') {
          navigate(-1);
        } else {
          navigate(intent.target);
        }

        // 3. Smoothly close popup
        const closeTimer = setTimeout(() => {
          deactivateVoiceMode();
        }, 600);

        return () => clearTimeout(closeTimer);
      }, 650);

      return () => clearTimeout(navTimer);
    } else {
      // Unrecognized navigation command
      setIsEvaluating(false);
      setCommandStatus({
        type: 'error',
        text: "I didn't understand the navigation command. Please try again.",
      });
      speakVoiceFeedback("I didn't understand the navigation command. Please try again.");
    }
  }, [wakeWord, navigate, deactivateVoiceMode, setIsListening]);

  // Reset state when voice popup opens/closes
  useEffect(() => {
    if (isVoiceModeActive) {
      setCommandStatus(null);
      setIsEvaluating(false);
      executionLockRef.current = false;

      // If wake word was activated with a trailing command (e.g. "MAPLA open expenses")
      if (transcript && transcript.trim()) {
        const directIntent = parseVoiceIntent(transcript, wakeWord);
        if (directIntent.type === 'NAVIGATE') {
          executeCommand(transcript);
        }
      }
    } else {
      setCommandStatus(null);
      setIsEvaluating(false);
      executionLockRef.current = false;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVoiceModeActive]);

  // Auto-scroll transcript container
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  // ─────────────────────────────────────────────────────────────────────────
  // EXACT 1.50s SILENCE TIMER:
  // Every time speech updates, wait 1.50 seconds of silence then execute
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isVoiceModeActive || executionLockRef.current || !transcript || !transcript.trim()) {
      setIsEvaluating(false);
      return;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    setIsEvaluating(true);

    silenceTimerRef.current = setTimeout(() => {
      if (isVoiceModeActive && !executionLockRef.current && currentTranscriptRef.current.trim()) {
        executeCommand(currentTranscriptRef.current);
      }
    }, SILENCE_TIMEOUT_MS);

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [transcript, isVoiceModeActive, executeCommand]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        deactivateVoiceMode();
      }
    };
    if (isVoiceModeActive) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVoiceModeActive, deactivateVoiceMode]);

  if (!isVoiceModeActive) return null;

  const isDenied = micPermission === 'denied';

  // User explicitly clicks "Stop Listening" -> execute immediately without waiting 1.5s
  const handleStopListening = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    setIsListening(false);
    setIsEvaluating(false);

    if (transcript && transcript.trim()) {
      executeCommand(transcript);
    }
  };

  // Direct manual suggestion click
  const handleSuggestionClick = (targetPath, label, feedback) => {
    if (executionLockRef.current) return;
    executionLockRef.current = true;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    setIsListening(false);
    setIsEvaluating(false);

    setCommandStatus({
      type: 'success',
      text: feedback,
      label,
      target: targetPath,
    });

    speakVoiceFeedback(feedback);

    setTimeout(() => {
      if (targetPath === 'BACK') navigate(-1);
      else navigate(targetPath);
      setTimeout(() => deactivateVoiceMode(), 600);
    }, 650);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      style={{
        background: 'rgba(3, 2, 12, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) deactivateVoiceMode();
      }}
    >
      {/* ── Center Glass Modal Box ────────────────────────────────────────── */}
      <div
        className="relative w-full max-w-md rounded-[32px] p-7 text-center border shadow-2xl overflow-hidden transition-all duration-300"
        style={{
          background: 'linear-gradient(160deg, rgba(28, 22, 58, 0.95) 0%, rgba(12, 10, 32, 0.98) 100%)',
          borderColor: commandStatus?.type === 'success' 
            ? 'rgba(52, 211, 153, 0.5)'
            : commandStatus?.type === 'error'
              ? 'rgba(244, 63, 94, 0.4)'
              : isListening 
                ? 'rgba(168, 85, 247, 0.4)' 
                : 'rgba(255, 255, 255, 0.1)',
          boxShadow: commandStatus?.type === 'success'
            ? '0 0 70px rgba(52, 211, 153, 0.25), 0 25px 60px rgba(0, 0, 0, 0.8)'
            : isListening
              ? '0 0 70px rgba(168, 85, 247, 0.25), 0 25px 60px rgba(0, 0, 0, 0.8)'
              : '0 25px 60px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-40 rounded-full pointer-events-none opacity-40 blur-3xl"
          style={{ 
            background: commandStatus?.type === 'success'
              ? 'radial-gradient(circle, #34d399 0%, transparent 70%)'
              : 'radial-gradient(circle, #a855f7 0%, transparent 70%)' 
          }}
        />

        {/* ── Top Header Bar ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between relative z-10 mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${commandStatus?.type === 'success' ? 'bg-emerald-400' : 'bg-purple-400'} animate-pulse`} />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-purple-300">
              Tracklytics Voice Navigation
            </span>
          </div>

          <button
            onClick={deactivateVoiceMode}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* ── Concentric Pulsing Microphone / Status Icon ─────────────────── */}
        <div className="py-5 relative flex items-center justify-center">
          {/* Animated concentric pulse waves */}
          {isListening && !commandStatus && (
            <>
              <div
                className="absolute rounded-full border border-purple-500/30"
                style={{
                  width: 110,
                  height: 110,
                  animation: 'voiceRingWave 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite',
                }}
              />
              <div
                className="absolute rounded-full border border-purple-500/20"
                style={{
                  width: 140,
                  height: 140,
                  animation: 'voiceRingWave 2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s infinite',
                }}
              />
              <div
                className="absolute rounded-full border border-purple-500/10"
                style={{
                  width: 170,
                  height: 170,
                  animation: 'voiceRingWave 2s cubic-bezier(0.2, 0.8, 0.2, 1) 1s infinite',
                }}
              />
            </>
          )}

          {/* Central Mic / Action Container */}
          <div
            className="relative rounded-full flex items-center justify-center transition-all duration-300 shadow-xl"
            style={{
              width: 88,
              height: 88,
              background: isDenied
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.15))'
                : commandStatus?.type === 'success'
                  ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.35), rgba(16, 185, 129, 0.2))'
                  : commandStatus?.type === 'error'
                    ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.3), rgba(225, 29, 72, 0.15))'
                    : isListening
                      ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.35), rgba(126, 34, 206, 0.2))'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
              border: isDenied
                ? '2px solid rgba(239, 68, 68, 0.5)'
                : commandStatus?.type === 'success'
                  ? '2px solid rgba(52, 211, 153, 0.7)'
                  : commandStatus?.type === 'error'
                    ? '2px solid rgba(244, 63, 94, 0.6)'
                    : isListening
                      ? '2px solid rgba(168, 85, 247, 0.65)'
                      : '1.5px solid rgba(255, 255, 255, 0.15)',
              boxShadow: commandStatus?.type === 'success'
                ? '0 0 35px rgba(52, 211, 153, 0.4), inset 0 0 20px rgba(52, 211, 153, 0.2)'
                : isListening
                  ? '0 0 35px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(168, 85, 247, 0.2)'
                  : 'none',
              animation: isListening && !commandStatus ? 'micHeartbeat 1.6s ease-in-out infinite' : 'none',
            }}
          >
            {isDenied ? (
              <FiMicOff className="w-9 h-9 text-rose-400" />
            ) : commandStatus?.type === 'success' ? (
              <FiCheckCircle className="w-9 h-9 text-emerald-400 animate-in zoom-in-50 duration-200" />
            ) : commandStatus?.type === 'error' ? (
              <FiAlertCircle className="w-9 h-9 text-rose-400 animate-in zoom-in-50 duration-200" />
            ) : (
              <FiMic
                className="w-9 h-9 transition-colors"
                style={{ color: isListening ? '#f3e8ff' : '#94a3b8' }}
              />
            )}
          </div>
        </div>

        {/* ── Waveform Animation ──────────────────────────────────────────── */}
        <div className="py-1 flex justify-center">
          <WaveformAnimation 
            isActive={isListening && !isDenied && !commandStatus} 
            color={commandStatus?.type === 'success' ? '#34d399' : '#c084fc'} 
          />
        </div>

        {/* ── Status Banner / Feedback Message ─────────────────────────────── */}
        <div className="mt-2 mb-3 min-h-[38px] flex flex-col items-center justify-center">
          {commandStatus?.type === 'success' ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-lg shadow-emerald-950/40 animate-in zoom-in-95 duration-200">
              <FiCompass className="w-3.5 h-3.5" />
              <span>{commandStatus.text}</span>
            </div>
          ) : commandStatus?.type === 'error' ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold animate-in zoom-in-95 duration-200">
              <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{commandStatus.text}</span>
            </div>
          ) : isDenied ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-rose-400">Microphone Permission Denied</p>
              <p className="text-xs text-slate-400">
                Please allow microphone access in your browser to use voice commands.
              </p>
            </div>
          ) : isEvaluating ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium animate-pulse">
              <FiClock className="w-3 h-3" />
              <span>Processing command in 2.6s…</span>
            </div>
          ) : isListening ? (
            <div>
              <p className="text-sm font-bold text-white tracking-wide">Listening for command…</p>
              <p className="text-[11px] text-purple-300/80 mt-0.5">e.g. “Go to study block”, “Open expenses”, “Show analytics”</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-slate-300">Listening Paused</p>
              <p className="text-xs text-slate-500 mt-0.5">Click Stop or choose a destination below</p>
            </div>
          )}
        </div>

        {/* ── Live Speech-to-Text Transcript Preview ───────────────────────── */}
        <div
          ref={transcriptRef}
          className="w-full min-h-[58px] max-h-24 overflow-y-auto rounded-2xl p-3 text-sm leading-relaxed border transition-all text-center flex items-center justify-center"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderColor: transcript ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.08)',
            color: transcript ? '#ffffff' : '#64748b',
          }}
        >
          {transcript ? (
            <span className="text-white font-medium">“{transcript}”</span>
          ) : (
            <span className="italic text-slate-500 text-xs">
              {isDenied ? 'Microphone unavailable' : `Say “Go to study block”, “Open expenses”, “Show analytics”…`}
            </span>
          )}
        </div>

        {/* ── Quick Voice Navigation Suggestion Chips ──────────────────────── */}
        <div className="mt-4 pt-3 border-t border-white/8 text-left">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
            <FiCompass className="w-3 h-3 text-purple-400" /> Voice Navigation Commands
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Expenses', path: '/expense', voice: 'Opening Expenses.' },
              { label: 'Study Tracker', path: '/study', voice: 'Opening Study Tracker.' },
              { label: 'Analytics', path: '/analytics', voice: 'Opening Analytics.' },
              { label: 'Dashboard', path: '/', voice: 'Opening Dashboard.' },
              { label: 'Calendar', path: '/calendar', voice: 'Opening Calendar.' },
              { label: 'Reports', path: '/reports', voice: 'Opening Reports.' },
              { label: 'Settings', path: '/settings', voice: 'Opening Settings.' },
              { label: 'Go Back', path: 'BACK', voice: 'Going back.' },
            ].map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleSuggestionClick(chip.path, chip.label, chip.voice)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-white border border-white/8 hover:border-purple-400/30 transition-all flex items-center gap-1 group"
              >
                <span>“{chip.label}”</span>
                <FiArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-purple-400 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Action Buttons ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-3 mt-5">
          {isListening && !isDenied && !commandStatus && (
            <button
              onClick={handleStopListening}
              className="flex items-center gap-2 px-5 py-2 rounded-2xl text-xs font-semibold tracking-wide transition-all"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.28)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)')}
            >
              <FiSquare className="w-3.5 h-3.5" />
              Execute Now
            </button>
          )}

          <button
            onClick={deactivateVoiceMode}
            className="flex items-center gap-2 px-6 py-2 rounded-2xl text-xs font-semibold tracking-wide text-slate-300 transition-all hover:text-white"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
          >
            <FiX className="w-3.5 h-3.5" />
            Close
          </button>
        </div>

        {/* Footer Hint */}
        <div className="mt-3 text-[10px] text-slate-500">
          Wake word: <span className="text-purple-400 font-bold">{wakeWord}</span> · Press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-400">Esc</kbd> to close
        </div>
      </div>

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes micHeartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes voiceRingWave {
          0% { transform: scale(0.85); opacity: 0.8; }
          100% { transform: scale(1.45); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default VoicePopup;
