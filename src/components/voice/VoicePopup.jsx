/**
 * ============================================================================
 * FILE: src/components/voice/VoicePopup.jsx
 * ============================================================================
 * Luna — Continuous listening popup.
 *
 * BEHAVIOURS:
 *   ① Wake word activates → Luna greets → popup opens → listens forever
 *   ② User speaks a command → 2.60s silence → executes → clears transcript
 *      → immediately listens for next command (NO wake word needed again)
 *   ③ User says "exit / close / stop / goodbye / quit" → popup closes
 *   ④ Close button or Esc key → popup closes
 *   ⑤ After closing → background wake word watcher restarts silently
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
} from 'react-icons/fi';
import { useVoice } from '../../context/VoiceContext';
import WaveformAnimation from './WaveformAnimation';
import { parseVoiceIntent } from '../../services/voiceIntentService';
import { speakVoiceFeedback } from '../../services/lunaVoiceService';

// Exactly 2.60 seconds of silence before executing a command
const SILENCE_TIMEOUT_MS = 2600;

// Words that close Luna
const EXIT_WORDS = ['exit', 'close', 'stop', 'quit', 'goodbye', 'bye', 'dismiss', 'cancel'];

function isExitCommand(text) {
  if (!text) return false;
  const t = text.toLowerCase().trim();
  return EXIT_WORDS.some((w) => t === w || t.includes(w));
}

// ── Sparkle decoration ───────────────────────────────────────────────────────
const Sparkles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[32px]">
    {[
      { top: '10%', left: '8%',  size: 4, delay: '0s',   opacity: 0.28 },
      { top: '7%',  left: '88%', size: 3, delay: '0.5s', opacity: 0.22 },
      { top: '78%', left: '93%', size: 4, delay: '1.0s', opacity: 0.18 },
      { top: '84%', left: '5%',  size: 3, delay: '1.4s', opacity: 0.28 },
    ].map((s, i) => (
      <div
        key={i}
        className="absolute rounded-full"
        style={{
          top: s.top, left: s.left,
          width: s.size, height: s.size,
          background: 'rgba(216,180,254,1)',
          opacity: s.opacity,
          animation: `lunaSparkle 3s ease-in-out ${s.delay} infinite`,
        }}
      />
    ))}
  </div>
);

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

  const transcriptBoxRef = useRef(null);

  // Statuses: null | { type: 'success'|'error', text: string }
  const [commandStatus, setCommandStatus] = useState(null);
  const [isEvaluating, setIsEvaluating]   = useState(false);

  const executionLockRef    = useRef(false);
  const silenceTimerRef     = useRef(null);
  const currentTranscriptRef = useRef(transcript);
  currentTranscriptRef.current = transcript;

  // ── Clear silence timer ───────────────────────────────────────────────────
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // ── Reset to listening state (called after each command, success or error) ─
  const resetToListening = useCallback(() => {
    clearSilenceTimer();
    setCommandStatus(null);
    setIsEvaluating(false);
    executionLockRef.current = false;
    updateTranscript('');
    setIsListening(true);
  }, [clearSilenceTimer, updateTranscript, setIsListening]);

  // ── Execute the spoken command ────────────────────────────────────────────
  const executeCommand = useCallback(
    (textToParse) => {
      if (executionLockRef.current || !textToParse?.trim()) return;

      // Check exit first
      if (isExitCommand(textToParse)) {
        executionLockRef.current = true;
        clearSilenceTimer();
        speakVoiceFeedback('Goodbye! Closing Luna.');
        setTimeout(() => deactivateVoiceMode(), 800);
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

          // After navigating: wait 800ms then reset → continuous listening resumes
          setTimeout(() => {
            deactivateVoiceMode();
          }, 600);
        }, 650);
      } else {
        // Unknown command — tell user, reset after 2.5s, keep listening
        clearSilenceTimer();
        setIsEvaluating(false);
        setCommandStatus({
          type: 'error',
          text: "Didn't catch that. Say a page name, or 'exit' to close.",
        });
        speakVoiceFeedback("I didn't catch that. Please try again, or say exit to close.");

        setTimeout(() => resetToListening(), 2800);
      }
    },
    [wakeWord, navigate, deactivateVoiceMode, setIsListening, clearSilenceTimer, resetToListening]
  );

  // ── Open / close reset ────────────────────────────────────────────────────
  useEffect(() => {
    if (isVoiceModeActive) {
      setCommandStatus(null);
      setIsEvaluating(false);
      executionLockRef.current = false;
      updateTranscript('');

      // Handle trailing command in same breath as wake word
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

  // ── Auto-scroll transcript box ────────────────────────────────────────────
  useEffect(() => {
    if (transcriptBoxRef.current) {
      transcriptBoxRef.current.scrollTop = transcriptBoxRef.current.scrollHeight;
    }
  }, [transcript]);

  // ── 2.60s silence timer — resets on every new word spoken ────────────────
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

  // ── Escape key → close ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') deactivateVoiceMode(); };
    if (isVoiceModeActive) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isVoiceModeActive, deactivateVoiceMode]);

  if (!isVoiceModeActive) return null;

  const isDenied = micPermission === 'denied';
  const isSuccess = commandStatus?.type === 'success';
  const isError   = commandStatus?.type === 'error';

  // Chip tap — immediate manual navigation
  const handleChipClick = (targetPath, label, feedback) => {
    if (executionLockRef.current) return;
    executionLockRef.current = true;
    clearSilenceTimer();
    setIsListening(false);
    setIsEvaluating(false);
    setCommandStatus({ type: 'success', text: feedback });
    speakVoiceFeedback(feedback);
    setTimeout(() => {
      if (targetPath === 'BACK') navigate(-1);
      else navigate(targetPath);
      setTimeout(() => deactivateVoiceMode(), 600);
    }, 650);
  };

  // Execute now button
  const handleExecuteNow = () => {
    clearSilenceTimer();
    setIsListening(false);
    setIsEvaluating(false);
    if (transcript?.trim()) executeCommand(transcript);
  };

  // ─── colour helpers ───────────────────────────────────────────────────────
  const borderColor = isSuccess
    ? 'rgba(52,211,153,0.5)'
    : isError
    ? 'rgba(244,63,94,0.4)'
    : isListening
    ? 'rgba(192,132,252,0.45)'
    : 'rgba(255,255,255,0.1)';

  const glowColor = isSuccess
    ? 'radial-gradient(circle, #34d399 0%, transparent 70%)'
    : 'radial-gradient(circle, #c084fc 0%, transparent 70%)';

  const iconBg = isDenied
    ? 'linear-gradient(135deg,rgba(239,68,68,.25),rgba(185,28,28,.15))'
    : isSuccess
    ? 'linear-gradient(135deg,rgba(52,211,153,.35),rgba(16,185,129,.2))'
    : isError
    ? 'linear-gradient(135deg,rgba(244,63,94,.3),rgba(225,29,72,.15))'
    : isListening
    ? 'linear-gradient(135deg,rgba(168,85,247,.35),rgba(126,34,206,.2))'
    : 'linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.02))';

  const iconBorder = isSuccess
    ? '2px solid rgba(52,211,153,.7)'
    : isError
    ? '2px solid rgba(244,63,94,.6)'
    : isListening
    ? '2px solid rgba(168,85,247,.65)'
    : '1.5px solid rgba(255,255,255,.15)';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none"
      style={{
        background: 'rgba(3,2,12,0.83)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        animation: 'lunaFadeIn 0.2s ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) deactivateVoiceMode(); }}
    >
      <div
        className="relative w-full max-w-md rounded-[32px] p-7 text-center border shadow-2xl overflow-hidden transition-colors duration-300"
        style={{
          background: 'linear-gradient(160deg,rgba(35,18,70,.97) 0%,rgba(12,8,32,.99) 100%)',
          borderColor,
          boxShadow: isSuccess
            ? '0 0 70px rgba(52,211,153,.25),0 25px 60px rgba(0,0,0,.8)'
            : isListening
            ? '0 0 70px rgba(192,132,252,.28),0 25px 60px rgba(0,0,0,.8)'
            : '0 25px 60px rgba(0,0,0,.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Sparkles />

        {/* Ambient glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-40 rounded-full pointer-events-none blur-3xl opacity-35"
          style={{ background: glowColor }}
        />

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between relative z-10 mb-1">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
              style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}
            >
              L
            </div>
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Luna · Voice AI
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

        {/* ── Mic Icon + Pulse Rings ───────────────────────────────────────── */}
        <div className="py-5 relative flex items-center justify-center">
          {isListening && !commandStatus && (
            <>
              {[110, 140, 170].map((size, i) => (
                <div
                  key={size}
                  className="absolute rounded-full border border-purple-400/25"
                  style={{
                    width: size, height: size,
                    animation: `voiceRingWave 2s cubic-bezier(0.2,0.8,0.2,1) ${i * 0.5}s infinite`,
                  }}
                />
              ))}
            </>
          )}

          <div
            className="relative rounded-full flex items-center justify-center shadow-xl"
            style={{
              width: 88, height: 88,
              background: iconBg,
              border: iconBorder,
              boxShadow: isSuccess
                ? '0 0 35px rgba(52,211,153,.4),inset 0 0 20px rgba(52,211,153,.2)'
                : isListening
                ? '0 0 35px rgba(168,85,247,.4),inset 0 0 20px rgba(168,85,247,.2)'
                : 'none',
              animation: isListening && !commandStatus ? 'micHeartbeat 1.6s ease-in-out infinite' : 'none',
            }}
          >
            {isDenied       ? <FiMicOff    className="w-9 h-9 text-rose-400" />
             : isSuccess    ? <FiCheckCircle className="w-9 h-9 text-emerald-400" />
             : isError      ? <FiAlertCircle className="w-9 h-9 text-rose-400" />
             :                <FiMic className="w-9 h-9" style={{ color: isListening ? '#f3e8ff' : '#94a3b8' }} />
            }
          </div>
        </div>

        {/* ── Waveform ─────────────────────────────────────────────────────── */}
        <div className="py-1 flex justify-center">
          <WaveformAnimation
            isActive={isListening && !isDenied && !commandStatus}
            color={isSuccess ? '#34d399' : '#c084fc'}
          />
        </div>

        {/* ── Status Banner ────────────────────────────────────────────────── */}
        <div className="mt-2 mb-3 min-h-[38px] flex flex-col items-center justify-center">
          {isSuccess ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <FiCompass className="w-3.5 h-3.5" />
              <span>{commandStatus.text}</span>
            </div>
          ) : isError ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
              <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{commandStatus.text}</span>
            </div>
          ) : isDenied ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-rose-400">Microphone Permission Denied</p>
              <p className="text-xs text-slate-400">Allow microphone access in your browser settings.</p>
            </div>
          ) : isEvaluating ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium animate-pulse">
              <FiClock className="w-3 h-3" />
              <span>Processing in 2.6s…</span>
            </div>
          ) : isListening ? (
            <div>
              <p className="text-sm font-bold text-white tracking-wide">I'm listening… 🎙️</p>
              <p className="text-[11px] text-purple-300/80 mt-0.5">
                Say a page name · say <span className="font-semibold text-rose-300">"exit"</span> to close
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Ready</p>
          )}
        </div>

        {/* ── Live Transcript Preview ──────────────────────────────────────── */}
        <div
          ref={transcriptBoxRef}
          className="w-full min-h-[52px] max-h-20 overflow-y-auto rounded-2xl p-3 text-sm leading-relaxed border transition-all text-center flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderColor: transcript ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.08)',
          }}
        >
          {transcript ? (
            <span className="text-white font-medium">"{transcript}"</span>
          ) : (
            <span className="italic text-slate-500 text-xs">
              {isDenied ? 'Microphone unavailable' : 'Start speaking your command…'}
            </span>
          )}
        </div>

        {/* ── Quick Navigation Chips ───────────────────────────────────────── */}
        <div className="mt-4 pt-3 border-t border-white/[0.07] text-left">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
            <FiCompass className="w-3 h-3 text-purple-400" /> Quick Navigation
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Dashboard',  path: '/',          voice: 'Opening Dashboard.' },
              { label: 'Expenses',   path: '/expense',   voice: 'Opening Expenses.' },
              { label: 'Study',      path: '/study',     voice: 'Opening Study Tracker.' },
              { label: 'Analytics',  path: '/analytics', voice: 'Opening Analytics.' },
              { label: 'Calendar',   path: '/calendar',  voice: 'Opening Calendar.' },
              { label: 'Reports',    path: '/reports',   voice: 'Opening Reports.' },
              { label: 'Settings',   path: '/settings',  voice: 'Opening Settings.' },
              { label: 'Go Back',    path: 'BACK',       voice: 'Going back.' },
            ].map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleChipClick(chip.path, chip.label, chip.voice)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-white border border-white/[0.07] hover:border-purple-400/30 transition-all flex items-center gap-1 group"
              >
                <span>{chip.label}</span>
                <FiArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-purple-400 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Action Buttons ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-3 mt-5">
          {isListening && !isDenied && !commandStatus && transcript?.trim() && (
            <button
              onClick={handleExecuteNow}
              className="flex items-center gap-2 px-5 py-2 rounded-2xl text-xs font-semibold tracking-wide transition-all"
              style={{
                background: 'rgba(168,85,247,0.18)',
                border: '1px solid rgba(168,85,247,0.38)',
                color: '#e9d5ff',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(168,85,247,0.32)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(168,85,247,0.18)')}
            >
              ⚡ Execute Now
            </button>
          )}

          <button
            onClick={deactivateVoiceMode}
            className="flex items-center gap-2 px-6 py-2 rounded-2xl text-xs font-semibold tracking-wide text-slate-300 hover:text-white transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            <FiX className="w-3.5 h-3.5" /> Close
          </button>
        </div>

        {/* Footer */}
        <div className="mt-3 text-[10px] text-slate-500">
          Wake word: <span className="text-purple-400 font-bold">{wakeWord}</span> ·{' '}
          Say <span className="text-rose-400 font-semibold">"exit"</span> or press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-400">Esc</kbd> to close
        </div>
      </div>

      {/* ── Global Animations ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes lunaFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes micHeartbeat {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.06); }
        }
        @keyframes voiceRingWave {
          0%   { transform: scale(0.85); opacity: 0.75; }
          100% { transform: scale(1.5);  opacity: 0; }
        }
        @keyframes lunaSparkle {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50%       { opacity: 0.55; transform: scale(1.6); }
        }
      `}</style>
    </div>
  );
};

export default VoicePopup;
