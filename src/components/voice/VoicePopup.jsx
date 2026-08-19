/**
 * ============================================================================
 * FILE: src/components/voice/VoicePopup.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Premium Voice Assistant popup modal that displays in the center of the screen
 *   whenever voice mode is activated (either by wake word "MAPLA" or mic button).
 *
 * FEATURES:
 *   - z-[9999] top-level overlay with frosted glass backdrop blur
 *   - Center stage with smooth entrance animation
 *   - Pulsing glowing microphone with concentric sound rings
 *   - Live audio waveform visualization
 *   - Real-time speech-to-text transcription preview box
 *   - Stop Listening and Close buttons
 *   - Keyboard shortcut (Escape to dismiss)
 *   - Graceful microphone permission handling
 * ============================================================================
 */

import React, { useEffect, useRef } from 'react';
import { FiMic, FiMicOff, FiX, FiSquare, FiCheck } from 'react-icons/fi';
import { useVoice } from '../../context/VoiceContext';
import WaveformAnimation from './WaveformAnimation';

export const VoicePopup = () => {
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

  // Auto-scroll transcript box as new words are spoken
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

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

  const handleStopListening = () => {
    setIsListening(false);
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
          borderColor: isListening ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255, 255, 255, 0.1)',
          boxShadow: isListening
            ? '0 0 70px rgba(168, 85, 247, 0.25), 0 25px 60px rgba(0, 0, 0, 0.8)'
            : '0 25px 60px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-40 rounded-full pointer-events-none opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}
        />

        {/* ── Top Header Bar ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between relative z-10 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-purple-300">
              Tracklytics Voice
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

        {/* ── Concentric Pulsing Microphone ───────────────────────────────── */}
        <div className="py-6 relative flex items-center justify-center">
          {/* Animated concentric pulse waves */}
          {isListening && (
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

          {/* Central Mic Button Container */}
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl"
            style={{
              background: isDenied
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.15))'
                : isListening
                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.35), rgba(126, 34, 206, 0.2))'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
              border: isDenied
                ? '2px solid rgba(239, 68, 68, 0.5)'
                : isListening
                  ? '2px solid rgba(168, 85, 247, 0.65)'
                  : '1.5px solid rgba(255, 255, 255, 0.15)',
              boxShadow: isListening
                ? '0 0 35px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(168, 85, 247, 0.2)'
                : 'none',
              animation: isListening ? 'micHeartbeat 1.6s ease-in-out infinite' : 'none',
            }}
          >
            {isDenied ? (
              <FiMicOff className="w-10 h-10 text-rose-400" />
            ) : (
              <FiMic
                className="w-10 h-10 transition-colors"
                style={{ color: isListening ? '#f3e8ff' : '#94a3b8' }}
              />
            )}
          </div>
        </div>

        {/* ── Waveform Animation ──────────────────────────────────────────── */}
        <div className="py-2 flex justify-center">
          <WaveformAnimation isActive={isListening && !isDenied} color="#c084fc" />
        </div>

        {/* ── Status Text ─────────────────────────────────────────────────── */}
        <div className="mt-2 mb-4">
          {isDenied ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-rose-400">Microphone Permission Denied</p>
              <p className="text-xs text-slate-400">
                Please allow microphone access in your browser address bar to use voice commands.
              </p>
            </div>
          ) : isListening ? (
            <div>
              <p className="text-base font-bold text-white tracking-wide">Listening…</p>
              <p className="text-xs text-purple-300/80 mt-0.5">Speak clearly into your microphone</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-slate-300">Listening Paused</p>
              <p className="text-xs text-slate-500 mt-0.5">Transcript captured below</p>
            </div>
          )}
        </div>

        {/* ── Live Speech-to-Text Transcript Preview ───────────────────────── */}
        <div
          ref={transcriptRef}
          className="w-full min-h-[68px] max-h-32 overflow-y-auto rounded-2xl p-3.5 text-sm leading-relaxed border transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderColor: transcript ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.08)',
            color: transcript ? '#ffffff' : '#64748b',
          }}
        >
          {transcript ? (
            <span className="text-white font-medium">"{transcript}"</span>
          ) : (
            <span className="italic text-slate-500 text-xs">
              {isDenied ? 'Microphone unavailable' : `Say a command like "add expense" or "start study timer"…`}
            </span>
          )}
        </div>

        {/* ── Action Buttons ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-3 mt-6 pt-2">
          {isListening && !isDenied && (
            <button
              onClick={handleStopListening}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.28)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)')}
            >
              <FiSquare className="w-3.5 h-3.5" />
              Stop Listening
            </button>
          )}

          <button
            onClick={deactivateVoiceMode}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-semibold tracking-wide text-slate-300 transition-all hover:text-white"
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
        <div className="mt-4 text-[10px] text-slate-500">
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
