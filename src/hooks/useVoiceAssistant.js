/**
 * ============================================================================
 * FILE: src/hooks/useVoiceAssistant.js
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   High-reliability, rock-solid voice assistant hook for Tracklytics.
 *
 * KEY STABILITY PRINCIPLES:
 *   1. All dynamic states (wakeWord, wakeWordEnabled, isVoiceModeActive) are
 *      mirrored in useRefs to prevent React Hook dependency cycles and infinite loops.
 *   2. SILENT BACKGROUND WATCHER:
 *      - Stably listens for the wake word (e.g., "MAPLA")
 *      - Includes phonetic / fuzzy detection (e.g. "maple", "map la", "mopla")
 *      - Calls activateVoiceMode() immediately upon detection
 *   3. ACTIVE LISTENING MODE:
 *      - Automatically takes over when the popup is open
 *      - Streams live speech transcript to the popup in real-time
 *      - Stops cleanly when user closes the popup
 * ============================================================================
 */

import { useEffect, useRef, useCallback } from 'react';
import { useVoice } from '../context/VoiceContext';

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition || null
    : null;

// Phonetic & common STT mistranscriptions for "MAPLA"
const MAPLA_VARIATIONS = [
  'MAPLA',
  'MAAPLA',
  'MAPLE',
  'MAP LA',
  'MAP-LA',
  'MOPLA',
  'MOBLA',
  'MARPLE',
  'MATLA',
  'MATHLA',
  'MAFLA',
  'MABLA',
  'MAP L',
  'MAPLE A',
  'MAHPLA',
];

/**
 * Robust phonetic / fuzzy wake word matcher
 */
function matchesWakeWord(spokenText, configuredWakeWord) {
  if (!spokenText || !configuredWakeWord) return false;

  const cleanSpoken = spokenText
    .toUpperCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const cleanTarget = configuredWakeWord.toUpperCase().trim();

  // 1. Direct match
  if (cleanSpoken.includes(cleanTarget)) return true;

  // 2. Phonetic variations for default "MAPLA"
  if (cleanTarget === 'MAPLA') {
    for (const v of MAPLA_VARIATIONS) {
      if (cleanSpoken.includes(v)) return true;
    }
  }

  // 3. Token-by-token fuzzy check (Levenshtein distance <= 1)
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

  // Stable references for state to avoid dependency loops in callbacks
  const wakeWordRef = useRef(wakeWord);
  wakeWordRef.current = wakeWord;

  const wakeWordEnabledRef = useRef(wakeWordEnabled);
  wakeWordEnabledRef.current = wakeWordEnabled;

  const isVoiceModeActiveRef = useRef(isVoiceModeActive);
  isVoiceModeActiveRef.current = isVoiceModeActive;

  // Recognition instances and flow flags
  const backgroundRecRef = useRef(null);
  const activeRecRef = useRef(null);
  const isWatcherRunningRef = useRef(false);
  const isActiveRunningRef = useRef(false);
  const lastTriggerTimeRef = useRef(0);
  const restartTimerRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────
  // STOP ACTIVE LISTENER (Popup Mode)
  // ─────────────────────────────────────────────────────────────────────────
  const stopActiveListener = useCallback(() => {
    isActiveRunningRef.current = false;
    setIsListening(false);

    if (activeRecRef.current) {
      try {
        activeRecRef.current.onresult = null;
        activeRecRef.current.onerror = null;
        activeRecRef.current.onend = null;
        activeRecRef.current.stop();
      } catch {
        // ignore
      }
      activeRecRef.current = null;
    }
  }, [setIsListening]);

  // ─────────────────────────────────────────────────────────────────────────
  // START ACTIVE LISTENER (Popup Mode — streams transcript into modal)
  // ─────────────────────────────────────────────────────────────────────────
  const startActiveListener = useCallback(() => {
    if (!SpeechRecognitionAPI) return;
    stopActiveListener();

    isActiveRunningRef.current = true;
    setIsListening(true);

    try {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = navigator.language || 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setMicPermission('granted');
      };

      rec.onresult = (event) => {
        let fullText = '';
        for (let i = 0; i < event.results.length; i++) {
          fullText += event.results[i][0].transcript + ' ';
        }
        updateTranscript(fullText.trim());
      };

      rec.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicPermission('denied');
        }
      };

      rec.onend = () => {
        if (isActiveRunningRef.current) {
          try {
            rec.start();
          } catch {
            // ignore
          }
        } else {
          setIsListening(false);
        }
      };

      activeRecRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('[Voice Assistant] Active listener startup:', err);
      setIsListening(false);
    }
  }, [stopActiveListener, setIsListening, setMicPermission, updateTranscript]);

  // ─────────────────────────────────────────────────────────────────────────
  // STOP BACKGROUND WATCHER (Silent Wake Word Detector)
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
      } catch {
        // ignore
      }
      backgroundRecRef.current = null;
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // START BACKGROUND WATCHER (Silent Wake Word Detector)
  // ─────────────────────────────────────────────────────────────────────────
  const startBackgroundWatcher = useCallback(() => {
    if (!SpeechRecognitionAPI || !wakeWordEnabledRef.current || isVoiceModeActiveRef.current) {
      return;
    }
    stopBackgroundWatcher();

    isWatcherRunningRef.current = true;

    try {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 3;
      rec.lang = navigator.language || 'en-US';

      rec.onstart = () => {
        setMicPermission('granted');
      };

      rec.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          for (let j = 0; j < event.results[i].length; j++) {
            const spoken = event.results[i][j].transcript;
            
            if (matchesWakeWord(spoken, wakeWordRef.current)) {
              const now = Date.now();
              if (now - lastTriggerTimeRef.current > 2500) {
                lastTriggerTimeRef.current = now;
                console.log(`[Voice Assistant] Wake word recognized: "${spoken}"`);

                // Immediately open voice mode popup
                stopBackgroundWatcher();
                activateVoiceMode();
                return;
              }
            }
          }
        }
      };

      rec.onerror = (event) => {
        if (event.error === 'not-allowed') {
          setMicPermission('denied');
          isWatcherRunningRef.current = false;
        }
      };

      rec.onend = () => {
        // Keep silently running in the background as long as voice mode is not active
        if (isWatcherRunningRef.current && wakeWordEnabledRef.current && !isVoiceModeActiveRef.current) {
          restartTimerRef.current = setTimeout(() => {
            if (isWatcherRunningRef.current && !isVoiceModeActiveRef.current) {
              try {
                rec.start();
              } catch {
                startBackgroundWatcher();
              }
            }
          }, 300);
        }
      };

      backgroundRecRef.current = rec;
      rec.start();
    } catch {
      // ignore
    }
  }, [stopBackgroundWatcher, setMicPermission, activateVoiceMode]);

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECT: Handle mode transitions between Background & Active
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
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [isVoiceModeActive, wakeWordEnabled, startActiveListener, stopActiveListener, startBackgroundWatcher, stopBackgroundWatcher]);

  // ─────────────────────────────────────────────────────────────────────────
  // CLEANUP
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
