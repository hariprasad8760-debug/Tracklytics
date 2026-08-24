/**
 * ============================================================================
 * FILE: src/hooks/useVoiceAssistant.js
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   High-Performance, Low-Latency Voice Assistant Orchestrator.
 *
 * BEHAVIORS:
 *   1. Background wake-word detection for "MAPLA" (continuous, crash-proof).
 *   2. Instant activation with Web Audio futuristic chime.
 *   3. Real-time speech streaming into Voice Floating Bar.
 *   4. Fast <1s wake response, zero robotic speech delays.
 *   5. Self-restarting listener across page navigations.
 * ============================================================================
 */

import { useEffect, useRef, useCallback } from 'react';
import { useVoice } from '../context/VoiceContext';
import { playActivationChime } from '../services/voiceFeedbackService';

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition || null
    : null;

// Phonetic & STT variations for "MAPLA"
const MAPLA_VARIATIONS = [
  'MAPLA', 'MAAPLA', 'MAPLE', 'MAP LA', 'MAP-LA', 'MOPLA', 'MOBLA',
  'MARPLE', 'MATLA', 'MATHLA', 'MAFLA', 'MABLA', 'MAP L', 'MAPLE A',
  'MAHPLA', 'MOP LA', 'MAKLA', 'MARLA', 'MALA', 'METLA', 'MAFIA',
  'NAPLA', 'MATHELA',
];

function matchesWakeWord(spokenText, configuredWakeWord) {
  if (!spokenText || !configuredWakeWord) return false;

  const cleanSpoken = spokenText
    .toUpperCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const cleanTarget = configuredWakeWord.toUpperCase().trim();

  if (cleanSpoken.includes(cleanTarget)) return true;

  if (cleanTarget === 'MAPLA') {
    for (const v of MAPLA_VARIATIONS) {
      if (cleanSpoken.includes(v)) return true;
    }
  }

  const tokens = cleanSpoken.split(' ');
  for (const token of tokens) {
    if (token === cleanTarget) return true;
    if (cleanTarget.length >= 4 && token.length >= 4) {
      let diff = 0;
      const len = Math.min(token.length, cleanTarget.length);
      for (let i = 0; i < len; i++) {
        if (token[i] !== cleanTarget[i]) diff++;
      }
      diff += Math.abs(token.length - cleanTarget.length);
      if (diff <= 1) return true;
    }
  }

  return false;
}

function extractTrailingCommand(spokenText, configuredWakeWord) {
  if (!spokenText) return '';
  const allVariations = [configuredWakeWord, ...MAPLA_VARIATIONS];
  for (const v of allVariations) {
    const regex = new RegExp(`^.*?\\b${v}\\b\\s*`, 'i');
    if (regex.test(spokenText)) {
      return spokenText.replace(regex, '').trim();
    }
  }
  return '';
}

export const useVoiceAssistant = () => {
  const {
    wakeWord,
    wakeWordEnabled,
    isVoiceModeActive,
    micPermission,
    setMicPermission,
    setIsListening,
    activateVoiceMode,
    deactivateVoiceMode,
    updateTranscript,
  } = useVoice();

  // Stable refs for context values
  const wakeWordRef = useRef(wakeWord);
  wakeWordRef.current = wakeWord;

  const wakeWordEnabledRef = useRef(wakeWordEnabled);
  wakeWordEnabledRef.current = wakeWordEnabled;

  const isVoiceModeActiveRef = useRef(isVoiceModeActive);
  isVoiceModeActiveRef.current = isVoiceModeActive;

  const activateVoiceModeRef = useRef(activateVoiceMode);
  activateVoiceModeRef.current = activateVoiceMode;

  const setMicPermissionRef = useRef(setMicPermission);
  setMicPermissionRef.current = setMicPermission;

  const setIsListeningRef = useRef(setIsListening);
  setIsListeningRef.current = setIsListening;

  const updateTranscriptRef = useRef(updateTranscript);
  updateTranscriptRef.current = updateTranscript;

  // Recognition references
  const backgroundRecRef = useRef(null);
  const activeRecRef = useRef(null);
  const isWatcherRunningRef = useRef(false);
  const isActiveRunningRef = useRef(false);
  const lastTriggerTimeRef = useRef(0);
  const restartTimerRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────
  // STOP ACTIVE LISTENER
  // ─────────────────────────────────────────────────────────────────────────
  const stopActiveListener = useCallback(() => {
    isActiveRunningRef.current = false;
    setIsListeningRef.current(false);

    if (activeRecRef.current) {
      try {
        activeRecRef.current.onresult = null;
        activeRecRef.current.onerror = null;
        activeRecRef.current.onend = null;
        activeRecRef.current.stop();
      } catch { /* ignore */ }
      activeRecRef.current = null;
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // STOP BACKGROUND WATCHER
  // ─────────────────────────────────────────────────────────────────────────
  const stopBackgroundWatcher = useCallback(() => {
    isWatcherRunningRef.current = false;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (backgroundRecRef.current) {
      try {
        backgroundRecRef.current.onresult = null;
        backgroundRecRef.current.onerror = null;
        backgroundRecRef.current.onend = null;
        backgroundRecRef.current.stop();
      } catch { /* ignore */ }
      backgroundRecRef.current = null;
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // START BACKGROUND WATCHER (continuous wake word listener)
  // ─────────────────────────────────────────────────────────────────────────
  const startBackgroundWatcher = useCallback(() => {
    if (!SpeechRecognitionAPI || !wakeWordEnabledRef.current || isVoiceModeActiveRef.current) {
      return;
    }
    if (isWatcherRunningRef.current) return;

    isWatcherRunningRef.current = true;

    try {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 3;
      rec.lang = navigator.language || 'en-US';

      rec.onstart = () => {
        setMicPermissionRef.current('granted');
      };

      rec.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          for (let j = 0; j < event.results[i].length; j++) {
            const spoken = event.results[i][j].transcript;

            if (matchesWakeWord(spoken, wakeWordRef.current)) {
              const now = Date.now();
              if (now - lastTriggerTimeRef.current > 1200) {
                lastTriggerTimeRef.current = now;

                const trailingCommand = extractTrailingCommand(spoken, wakeWordRef.current);

                // Stop watcher immediately
                stopBackgroundWatcher();

                // Play high-tech activation chime
                playActivationChime();

                // Instantly open voice bar with zero delay
                activateVoiceModeRef.current(trailingCommand);
                return;
              }
            }
          }
        }
      };

      rec.onerror = (event) => {
        if (event.error === 'not-allowed') {
          setMicPermissionRef.current('denied');
          isWatcherRunningRef.current = false;
          return;
        }
      };

      rec.onend = () => {
        if (isWatcherRunningRef.current && wakeWordEnabledRef.current && !isVoiceModeActiveRef.current) {
          restartTimerRef.current = setTimeout(() => {
            if (isWatcherRunningRef.current && !isVoiceModeActiveRef.current) {
              try {
                rec.start();
              } catch {
                isWatcherRunningRef.current = false;
                startBackgroundWatcher();
              }
            }
          }, 180);
        }
      };

      backgroundRecRef.current = rec;
      try {
        rec.start();
      } catch { /* ignore */ }
    } catch { /* ignore */ }
  }, [stopBackgroundWatcher]);

  // ─────────────────────────────────────────────────────────────────────────
  // START ACTIVE LISTENER (real-time stream into floating bar)
  // ─────────────────────────────────────────────────────────────────────────
  const startActiveListener = useCallback(() => {
    if (!SpeechRecognitionAPI) return;
    stopActiveListener();

    isActiveRunningRef.current = true;
    setIsListeningRef.current(true);

    try {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = navigator.language || 'en-US';

      rec.onstart = () => {
        setIsListeningRef.current(true);
        setMicPermissionRef.current('granted');
      };

      rec.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        updateTranscriptRef.current(currentText.trim());
      };

      rec.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicPermissionRef.current('denied');
        }
      };

      rec.onend = () => {
        if (isActiveRunningRef.current) {
          try { rec.start(); } catch { /* ignore */ }
        } else {
          setIsListeningRef.current(false);
        }
      };

      activeRecRef.current = rec;
      try { rec.start(); } catch { /* ignore */ }
    } catch {
      setIsListeningRef.current(false);
    }
  }, [stopActiveListener]);

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECT: Mode transitions
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    if (isVoiceModeActive) {
      stopBackgroundWatcher();
      startActiveListener();
    } else {
      stopActiveListener();
      if (wakeWordEnabled) {
        const timer = setTimeout(() => {
          startBackgroundWatcher();
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [isVoiceModeActive, wakeWordEnabled, startActiveListener, stopActiveListener, startBackgroundWatcher, stopBackgroundWatcher]);

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECT: User Gesture Kickstart
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleGesture = () => {
      if (wakeWordEnabledRef.current && !isVoiceModeActiveRef.current && !isWatcherRunningRef.current) {
        try { startBackgroundWatcher(); } catch { /* ignore */ }
      }
    };

    window.addEventListener('click', handleGesture, { passive: true });
    window.addEventListener('keydown', handleGesture, { passive: true });

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, [startBackgroundWatcher]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBackgroundWatcher();
      stopActiveListener();
    };
  }, [stopBackgroundWatcher, stopActiveListener]);

  return {
    isSupported: !!SpeechRecognitionAPI,
    startActiveListener,
    stopActiveListener,
  };
};

export default useVoiceAssistant;
