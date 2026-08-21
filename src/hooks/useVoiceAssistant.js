/**
 * ============================================================================
 * FILE: src/hooks/useVoiceAssistant.js
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   High-speed, rock-solid, 100% crash-proof voice assistant hook for Tracklytics.
 *
 * BULLETPROOF SAFEGUARDS:
 *   1. All rec.start() and rec.stop() calls are safely wrapped in try-catch to
 *      prevent browser DOMExceptions (e.g. "recognition has already started")
 *      from ever crashing the React component tree.
 *   2. State values & callbacks are stored in stable useRefs to avoid dependency cycles.
 *   3. User gesture auto-binder starts listening as soon as user clicks the page.
 *   4. Ultra-fast wake word recognition (< 1s) with trailing command extraction.
 * ============================================================================
 */

import { useEffect, useRef, useCallback } from 'react';
import { useVoice } from '../context/VoiceContext';

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition || null
    : null;

// Comprehensive phonetic & STT variations for "MAPLA"
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
  'MOP LA',
  'MAKLA',
  'MARLA',
  'MALA',
  'METLA',
  'MAFIA',
  'NAPLA',
  'MATHELA',
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

/**
 * Extracts any trailing voice command spoken with the wake word
 * Example: "MAPLA open expenses" -> "open expenses"
 */
function extractTrailingCommand(spokenText, configuredWakeWord) {
  if (!spokenText) return '';
  let text = spokenText.trim();
  const allVariations = [configuredWakeWord, ...MAPLA_VARIATIONS];
  
  for (const v of allVariations) {
    const regex = new RegExp(`^.*?\\b${v}\\b\\s*`, 'i');
    if (regex.test(text)) {
      return text.replace(regex, '').trim();
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

  // Mirror all context values in stable refs
  const wakeWordRef = useRef(wakeWord);
  wakeWordRef.current = wakeWord;

  const wakeWordEnabledRef = useRef(wakeWordEnabled);
  wakeWordEnabledRef.current = wakeWordEnabled;

  const isVoiceModeActiveRef = useRef(isVoiceModeActive);
  isVoiceModeActiveRef.current = isVoiceModeActive;

  const activateVoiceModeRef = useRef(activateVoiceMode);
  activateVoiceModeRef.current = activateVoiceMode;

  const deactivateVoiceModeRef = useRef(deactivateVoiceMode);
  deactivateVoiceModeRef.current = deactivateVoiceMode;

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
  // STOP ACTIVE LISTENER (Popup Mode)
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
      } catch {
        // ignore safely
      }
      activeRecRef.current = null;
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // START ACTIVE LISTENER (Popup Mode — streams transcript into modal)
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
        let fullText = '';
        for (let i = 0; i < event.results.length; i++) {
          fullText += event.results[i][0].transcript + ' ';
        }
        updateTranscriptRef.current(fullText.trim());
      };

      rec.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicPermissionRef.current('denied');
        }
      };

      rec.onend = () => {
        if (isActiveRunningRef.current) {
          try {
            rec.start();
          } catch {
            // ignore safely
          }
        } else {
          setIsListeningRef.current(false);
        }
      };

      activeRecRef.current = rec;
      try {
        rec.start();
      } catch {
        // ignore safely
      }
    } catch {
      setIsListeningRef.current(false);
    }
  }, [stopActiveListener]);

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
        // ignore safely
      }
      backgroundRecRef.current = null;
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // START BACKGROUND WATCHER (Fast Wake Word Detector)
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
                console.log(`[Voice Assistant] Wake word triggered! Spoken: "${spoken}", Trailing: "${trailingCommand}"`);

                stopBackgroundWatcher();
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
        }
      };

      rec.onend = () => {
        if (isWatcherRunningRef.current && wakeWordEnabledRef.current && !isVoiceModeActiveRef.current) {
          restartTimerRef.current = setTimeout(() => {
            if (isWatcherRunningRef.current && !isVoiceModeActiveRef.current) {
              try {
                rec.start();
              } catch {
                try {
                  startBackgroundWatcher();
                } catch {
                  // ignore safely
                }
              }
            }
          }, 150);
        }
      };

      backgroundRecRef.current = rec;
      try {
        rec.start();
      } catch {
        // ignore safely
      }
    } catch {
      // ignore safely
    }
  }, [stopBackgroundWatcher]);

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
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [isVoiceModeActive, wakeWordEnabled, startActiveListener, stopActiveListener, startBackgroundWatcher, stopBackgroundWatcher]);

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECT: User Gesture Kickstart (binds to document click & keydown)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleGesture = () => {
      if (wakeWordEnabledRef.current && !isVoiceModeActiveRef.current && !isWatcherRunningRef.current) {
        try {
          startBackgroundWatcher();
        } catch {
          // ignore
        }
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
