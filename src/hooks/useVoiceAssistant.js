/**
 * ============================================================================
 * FILE: src/hooks/useVoiceAssistant.js
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Luna — Tracklytics' persistent voice AI.
 *
 * BEHAVIOURS:
 *   1. On first click/gesture: starts background wake-word listener.
 *   2. When "MAPLA" is detected:
 *        a. Plays greeting: "Hello Hari! I'm Luna. How can I help you today?"
 *        b. Opens the Voice Popup (modal)
 *        c. Starts active transcript listener
 *   3. When popup is closed:
 *        a. Active listener stops
 *        b. Background wake-word listener IMMEDIATELY restarts
 *        c. Luna stays alive for the rest of the session — perpetually listening
 *   4. All SpeechRecognition calls are wrapped in try-catch — 100% crash-proof.
 * ============================================================================
 */

import { useEffect, useRef, useCallback } from 'react';
import { useVoice } from '../context/VoiceContext';
import { lunaGreet } from '../services/lunaVoiceService';

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition || null
    : null;

// Comprehensive phonetic & STT variations for "MAPLA"
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

/**
 * Reads the user's first name from localStorage (set in AuthPage/profile settings).
 * Falls back gracefully to 'there' if not found.
 */
export function getUsername() {
  try {
    const raw = localStorage.getItem('tracklytics_user_profile');
    if (!raw) return 'there';
    const profile = JSON.parse(raw);
    // Extract first name from fullName (e.g. "Hari Prasath" → "Hari")
    const fullName = (profile.fullName || '').trim();
    const firstName = fullName.split(' ')[0] || 'there';
    return firstName;
  } catch {
    return 'there';
  }
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

  // Mirror all context values in stable refs
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

  // Recognition instances and lifecycle flags
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
  // START BACKGROUND WATCHER (persistent, self-restarting)
  // ─────────────────────────────────────────────────────────────────────────
  const startBackgroundWatcher = useCallback(() => {
    if (!SpeechRecognitionAPI || !wakeWordEnabledRef.current || isVoiceModeActiveRef.current) {
      return;
    }
    if (isWatcherRunningRef.current) return; // Already running

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
              if (now - lastTriggerTimeRef.current > 1500) {
                lastTriggerTimeRef.current = now;

                const trailingCommand = extractTrailingCommand(spoken, wakeWordRef.current);
                console.log(`[Luna] Wake word triggered! Spoken: "${spoken}", Trailing: "${trailingCommand}"`);

                // 1. Stop background watcher before greeting
                stopBackgroundWatcher();

                // 2. Greet user as Luna (sweet female voice), then open popup
                lunaGreet(getUsername(), () => {
                  // After greeting finishes, open the voice popup
                  activateVoiceModeRef.current(trailingCommand);
                });

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
        // Other errors (no-speech, aborted) — let onend restart it
      };

      rec.onend = () => {
        // Key: self-restart as long as voice popup is not open
        if (isWatcherRunningRef.current && wakeWordEnabledRef.current && !isVoiceModeActiveRef.current) {
          restartTimerRef.current = setTimeout(() => {
            if (isWatcherRunningRef.current && !isVoiceModeActiveRef.current) {
              try {
                rec.start();
              } catch {
                // rec is dead, spawn fresh one
                isWatcherRunningRef.current = false;
                startBackgroundWatcher();
              }
            }
          }, 200);
        }
      };

      backgroundRecRef.current = rec;
      try {
        rec.start();
      } catch { /* ignore */ }
    } catch { /* ignore */ }
  }, [stopBackgroundWatcher]);

  // ─────────────────────────────────────────────────────────────────────────
  // START ACTIVE LISTENER (streams live transcript into popup)
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
        // Only capture the current speech session — the most recent interim/final chunk.
        // This prevents transcript from growing forever and keeps each command fresh.
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
  // EFFECT: Mode transitions — popup open ↔ background listening
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    if (isVoiceModeActive) {
      // Popup just opened — start active listener
      stopBackgroundWatcher();
      startActiveListener();
    } else {
      // Popup closed — stop active listener, IMMEDIATELY resume background watching
      stopActiveListener();
      if (wakeWordEnabled) {
        const timer = setTimeout(() => {
          startBackgroundWatcher();
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [isVoiceModeActive, wakeWordEnabled, startActiveListener, stopActiveListener, startBackgroundWatcher, stopBackgroundWatcher]);

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECT: User Gesture Kickstart
  // Browsers require a user interaction before mic access.
  // After first click, Luna starts listening silently for the wake word.
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

  // ─────────────────────────────────────────────────────────────────────────
  // CLEANUP on unmount (page close / navigation)
  // ─────────────────────────────────────────────────────────────────────────
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
