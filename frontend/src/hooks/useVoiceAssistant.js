/**
 * ============================================================================
 * FILE: src/hooks/useVoiceAssistant.js
 * ============================================================================
 * RELIABLE WAKE WORD DETECTION + CONTINUOUS CONVERSATION
 *
 * KEY DESIGN DECISIONS:
 *   1. Uses 'en-IN' (Indian English) for better MAPLA recognition in India.
 *   2. Background watcher uses short sessions (NOT continuous) — Chrome's
 *      webkitSpeechRecognition works MORE reliably with shorter sessions that
 *      auto-restart rather than one long-running continuous session.
 *   3. Shows what the mic is hearing for debugging (brief flash on HUD).
 *   4. Mic button ALWAYS directly activates voice mode as backup.
 *   5. Extremely broad phonetic matching for "MAPLA".
 * ============================================================================
 */

import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import { playActivationChime, speakNaturalVoice } from '../services/voiceFeedbackService';
import { evaluateConversationTurn } from '../services/voiceDialogManager';

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition || null
    : null;

// ─── COMPREHENSIVE PHONETIC VARIATIONS FOR "MAPLA" & "LUNA" ──────────────────
// Indian English / browser STT commonly mishears "MAPLA" or "LUNA" as many things.
// We match ALL of them so activation is instantaneous and reliable.
const MAPLA_VARIATIONS = [
  'MAPLA', 'MAAPLA', 'MAPLAH', 'MAPLE', 'MAPLES',
  'MAP LA', 'MAP-LA', 'MAP LAH', 'MAP LAW',
  'MOPLA', 'MOBLA', 'MOBILA', 'MARPLA',
  'MARPLE', 'MARLA', 'MATLA', 'MATHLA', 'MAFLA', 'MABLA',
  'MAP L', 'MAPLE A', 'MAPLE AH', 'MAPLE AY',
  'MAHPLA', 'MOP LA', 'MAKLA', 'MALA',
  'METLA', 'MAFIA', 'NAPLA', 'MATHELA',
  'MAP ALLAH', 'MAP LAW', 'MAPLE AH', 'MAP LINE',
  'MOBILES', 'MATLAB', 'MALLA', 'MAHABLA', 'MAPPLA',
  'MOPLER', 'MARBLER', 'MUPPLA', 'MATHA', 'MACHLA',
  'MOKKA', 'MACLA', 'MAPNA', 'APPLA', 'AAPLA',
  'MAMA', 'MANLA', 'MAPPA', 'MAMPLA', 'MABLA',
  'TABLA', 'SABLA', 'KAPLA', 'PAMLA',
  'HEY MAPLA', 'OK MAPLA', 'HELLO MAPLA', 'HI MAPLA',
  'MAPLA LISTENING', 'MAPLA LISTEN',
];

const LUNA_VARIATIONS = [
  'LUNA', 'LOONA', 'LUNAR', 'LUNAA', 'LUNA LISTENING', 'LUNA LISTEN',
  'HEY LUNA', 'OK LUNA', 'HELLO LUNA', 'HI LUNA', 'DEAR LUNA',
  'LUNAS', 'LUNA ASSISTANT', 'LUNA BOT', 'LUNAR BOT',
  'LU NA', 'LOO NA', 'LUN', 'LUNAH', 'LOONAH',
];

const ALL_WAKE_WORDS = [...MAPLA_VARIATIONS, ...LUNA_VARIATIONS, 'TRACKLYTICS', 'HEY TRACKLYTICS'];

function matchesWakeWord(spokenText, configuredWakeWord) {
  if (!spokenText) return false;

  const cleanSpoken = spokenText
    .toUpperCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const cleanConfig = (configuredWakeWord || 'MAPLA').toUpperCase().trim();

  // 1. Direct match against configured wake word
  if (cleanSpoken.includes(cleanConfig)) return true;

  // 2. Direct match against ANY supported wake word (MAPLA, LUNA, etc.)
  for (const v of ALL_WAKE_WORDS) {
    if (cleanSpoken.includes(v)) return true;
  }

  // 3. Regex phonetic patterns for MAPLA
  if (/\bm[aeiou][a-z]{0,3}l[aeiou]?\b/i.test(cleanSpoken)) return true;
  if (/\bm[a-z]p[a-z]{0,2}[la]\b/i.test(cleanSpoken)) return true;

  // 4. Regex phonetic patterns for LUNA
  if (/\bl[uoo][n][ah]?\b/i.test(cleanSpoken)) return true;

  // 5. Token fuzzy distance (allow 1-char edit distance)
  const tokens = cleanSpoken.split(' ');
  const targets = [cleanConfig, 'MAPLA', 'LUNA'];
  for (const token of tokens) {
    for (const target of targets) {
      if (token === target) return true;
      if (target.length >= 3 && token.length >= 3) {
        const minLen = Math.min(token.length, target.length);
        let diff = Math.abs(token.length - target.length);
        for (let i = 0; i < minLen; i++) {
          if (token[i] !== target[i]) diff++;
        }
        if (diff <= 1) return true;
      }
    }
  }

  return false;
}

function extractTrailingCommand(spokenText, configuredWakeWord) {
  if (!spokenText) return '';
  const allTargets = [configuredWakeWord, ...ALL_WAKE_WORDS];
  for (const target of allTargets) {
    if (!target) continue;
    const regex = new RegExp(`^.*?\\b${target}\\b\\s*`, 'i');
    if (regex.test(spokenText)) {
      const rest = spokenText.replace(regex, '').trim();
      if (rest.length > 1) return rest;
    }
  }
  return '';
}

export const useVoiceAssistant = () => {
  const navigate = useNavigate();
  const {
    wakeWord,
    wakeWordEnabled,
    continuousMode,
    inactivityTimeoutSec,
    assistantVoice,
    conversationState,
    isVoiceModeActive,
    activeFlow,
    micPermission,
    pendingCommand,
    setConversationState,
    setActiveFlow,
    setLastAssistantMessage,
    setMicPermission,
    activateVoiceMode,
    deactivateVoiceMode,
    updateTranscript,
    clearPendingCommand,
  } = useVoice();

  // Stable refs
  const wakeWordRef = useRef(wakeWord);
  wakeWordRef.current = wakeWord;
  const wakeWordEnabledRef = useRef(wakeWordEnabled);
  wakeWordEnabledRef.current = wakeWordEnabled;
  const continuousModeRef = useRef(continuousMode);
  continuousModeRef.current = continuousMode;
  const inactivityTimeoutSecRef = useRef(inactivityTimeoutSec);
  inactivityTimeoutSecRef.current = inactivityTimeoutSec;
  const assistantVoiceRef = useRef(assistantVoice);
  assistantVoiceRef.current = assistantVoice;
  const conversationStateRef = useRef(conversationState);
  conversationStateRef.current = conversationState;
  const isVoiceModeActiveRef = useRef(isVoiceModeActive);
  isVoiceModeActiveRef.current = isVoiceModeActive;
  const activeFlowRef = useRef(activeFlow);
  activeFlowRef.current = activeFlow;

  // Recognition refs
  const backgroundRecRef = useRef(null);
  const activeRecRef = useRef(null);
  const isWatcherRunningRef = useRef(false);
  const isActiveRunningRef = useRef(false);
  const lastTriggerTimeRef = useRef(0);
  const restartTimerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const finalInactivityTimerRef = useRef(null);
  const micInitDoneRef = useRef(false);

  // ─── TIMER CLEANUP ────────────────────────────────────────────────────────
  const clearTimers = useCallback(() => {
    [silenceTimerRef, inactivityTimerRef, finalInactivityTimerRef, restartTimerRef].forEach(r => {
      if (r.current) { clearTimeout(r.current); r.current = null; }
    });
  }, []);

  // ─── STOP ACTIVE LISTENER ─────────────────────────────────────────────────
  const stopActiveListener = useCallback(() => {
    isActiveRunningRef.current = false;
    clearTimers();
    if (activeRecRef.current) {
      try {
        activeRecRef.current.onresult = null;
        activeRecRef.current.onerror = null;
        activeRecRef.current.onend = null;
        activeRecRef.current.abort();
      } catch { /* ignore */ }
      activeRecRef.current = null;
    }
  }, [clearTimers]);

  // ─── STOP BACKGROUND WATCHER ──────────────────────────────────────────────
  const stopBackgroundWatcher = useCallback(() => {
    isWatcherRunningRef.current = false;
    if (restartTimerRef.current) { clearTimeout(restartTimerRef.current); restartTimerRef.current = null; }
    if (backgroundRecRef.current) {
      try {
        backgroundRecRef.current.onresult = null;
        backgroundRecRef.current.onerror = null;
        backgroundRecRef.current.onend = null;
        backgroundRecRef.current.abort();
      } catch { /* ignore */ }
      backgroundRecRef.current = null;
    }
  }, []);

  // ─── PROCESS CONVERSATION TURN ────────────────────────────────────────────
  const processTurn = useCallback((spokenText) => {
    if (!spokenText || !spokenText.trim()) return;

    setConversationState('PROCESSING');
    stopActiveListener();

    const result = evaluateConversationTurn(spokenText, activeFlowRef.current, wakeWordRef.current);
    setActiveFlow(result.nextFlow);
    setLastAssistantMessage(result.responseText);

    if (result.type === 'NAVIGATE' && result.targetPath) {
      result.targetPath === 'BACK' ? navigate(-1) : navigate(result.targetPath);
    }

    if (result.type === 'STOP_CONVERSATION' || !result.shouldKeepListening) {
      setConversationState('ASSISTANT_RESPONDING');
      speakNaturalVoice(result.responseText, {
        voiceType: assistantVoiceRef.current,
        onEnd: () => deactivateVoiceMode(),
      });
      return;
    }

    setConversationState('ASSISTANT_RESPONDING');
    speakNaturalVoice(result.responseText, {
      voiceType: assistantVoiceRef.current,
      onEnd: () => {
        if (isVoiceModeActiveRef.current && continuousModeRef.current) {
          updateTranscript('');
          setConversationState('LISTENING');
          startActiveListener();
        } else {
          deactivateVoiceMode();
        }
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, setActiveFlow, setLastAssistantMessage, setConversationState, deactivateVoiceMode, updateTranscript, stopActiveListener]);

  // ─── INACTIVITY TIMER ─────────────────────────────────────────────────────
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (finalInactivityTimerRef.current) clearTimeout(finalInactivityTimerRef.current);

    if (!isVoiceModeActiveRef.current || conversationStateRef.current !== 'LISTENING') return;

    const warnMs = Math.max(15000, ((inactivityTimeoutSecRef.current || 60) - 10) * 1000);
    inactivityTimerRef.current = setTimeout(() => {
      if (!isVoiceModeActiveRef.current || conversationStateRef.current !== 'LISTENING') return;
      setConversationState('ASSISTANT_RESPONDING');
      setLastAssistantMessage('Are you still there?');
      stopActiveListener();
      speakNaturalVoice('Are you still there?', {
        voiceType: assistantVoiceRef.current,
        onEnd: () => {
          if (isVoiceModeActiveRef.current) {
            setConversationState('LISTENING');
            startActiveListener();
            finalInactivityTimerRef.current = setTimeout(() => {
              if (isVoiceModeActiveRef.current) {
                speakNaturalVoice('Ending voice session due to inactivity.', {
                  voiceType: assistantVoiceRef.current,
                  onEnd: () => deactivateVoiceMode(),
                });
              }
            }, 10000);
          }
        },
      });
    }, warnMs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setConversationState, setLastAssistantMessage, stopActiveListener, deactivateVoiceMode]);

  // ─── START ACTIVE LISTENER (conversation mode) ────────────────────────────
  const startActiveListener = useCallback(() => {
    if (!SpeechRecognitionAPI || !isVoiceModeActiveRef.current) return;
    stopActiveListener();
    isActiveRunningRef.current = true;
    resetInactivityTimer();

    try {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = 'en-IN'; // Indian English — better for Indian accents

      rec.onstart = () => setMicPermission('granted');

      rec.onresult = (event) => {
        resetInactivityTimer();
        let text = '';
        let isFinal = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript + ' ';
          if (event.results[i].isFinal) isFinal = true;
        }
        const cleanText = text.trim();
        updateTranscript(cleanText);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (cleanText) {
          // If browser finalized sentence, execute in 250ms; if interim silence, execute in 700ms
          const delay = isFinal ? 250 : 700;
          silenceTimerRef.current = setTimeout(() => {
            if (isVoiceModeActiveRef.current && cleanText) {
              processTurn(cleanText);
            }
          }, delay);
        }
      };

      rec.onerror = (e) => {
        if (e.error === 'not-allowed') setMicPermission('denied');
      };

      rec.onend = () => {
        if (isActiveRunningRef.current && isVoiceModeActiveRef.current && conversationStateRef.current === 'LISTENING') {
          try { rec.start(); } catch { /* ignore */ }
        }
      };

      activeRecRef.current = rec;
      rec.start();
    } catch { /* ignore */ }
  }, [stopActiveListener, resetInactivityTimer, setMicPermission, updateTranscript, processTurn]);

  // ─── START BACKGROUND WATCHER ─────────────────────────────────────────────
  const startBackgroundWatcher = useCallback(() => {
    if (!SpeechRecognitionAPI) return;
    if (!wakeWordEnabledRef.current) return;
    if (isVoiceModeActiveRef.current) return;
    if (isWatcherRunningRef.current) return;

    isWatcherRunningRef.current = true;

    const runSession = () => {
      if (!isWatcherRunningRef.current || isVoiceModeActiveRef.current) return;

      try {
        const rec = new SpeechRecognitionAPI();
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 5;
        rec.lang = 'en-IN';

        rec.onstart = () => {
          setMicPermission('granted');
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
                  stopBackgroundWatcher();
                  playActivationChime();
                  activateVoiceMode('', "I'm listening.");

                  if (trailingCommand) {
                    processTurn(trailingCommand);
                  } else {
                    setConversationState('ASSISTANT_RESPONDING');
                    speakNaturalVoice("I'm listening.", {
                      voiceType: assistantVoiceRef.current,
                      onEnd: () => {
                        if (isVoiceModeActiveRef.current) {
                          updateTranscript('');
                          setConversationState('LISTENING');
                          startActiveListener();
                        }
                      },
                    });
                  }
                  return;
                }
              }
            }
          }
        };

        rec.onerror = (event) => {
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setMicPermission('denied');
            isWatcherRunningRef.current = false;
            return;
          }
        };

        rec.onend = () => {
          if (isWatcherRunningRef.current && !isVoiceModeActiveRef.current) {
            restartTimerRef.current = setTimeout(runSession, 100);
          }
        };

        backgroundRecRef.current = rec;
        rec.start();
      } catch (err) {
        if (isWatcherRunningRef.current && !isVoiceModeActiveRef.current) {
          restartTimerRef.current = setTimeout(runSession, 400);
        }
      }
    };

    runSession();
  }, [stopBackgroundWatcher, setMicPermission, activateVoiceMode, processTurn, setConversationState, startActiveListener]);

  // ─── PROACTIVE MIC INIT ───────────────────────────────────────────────────
  const initMicPermission = useCallback(() => {
    if (micInitDoneRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) return;

    micInitDoneRef.current = true;
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach(t => t.stop());
        setMicPermission('granted');
        if (wakeWordEnabledRef.current && !isVoiceModeActiveRef.current) {
          startBackgroundWatcher();
        }
      })
      .catch(() => {
        setMicPermission('denied');
      });
  }, [setMicPermission, startBackgroundWatcher]);

  // ─── DIRECT VOICE ACTIVATION (for mic button clicks) ─────────────────────
  const activateDirectly = useCallback(() => {
    stopBackgroundWatcher();
    if (!isVoiceModeActiveRef.current) {
      playActivationChime();
      activateVoiceMode('', "I'm listening.");
      setConversationState('ASSISTANT_RESPONDING');
      speakNaturalVoice("I'm listening.", {
        voiceType: assistantVoiceRef.current,
        onEnd: () => {
          if (isVoiceModeActiveRef.current) {
            setConversationState('LISTENING');
            startActiveListener();
          }
        },
      });
    }
  }, [stopBackgroundWatcher, activateVoiceMode, setConversationState, startActiveListener]);

  // ─── PENDING COMMAND EFFECT ───────────────────────────────────────────────
  useEffect(() => {
    if (pendingCommand && pendingCommand.trim()) {
      if (!isVoiceModeActiveRef.current) {
        activateVoiceMode('', "I'm listening.");
      }
      processTurn(pendingCommand);
      clearPendingCommand();
    }
  }, [pendingCommand, processTurn, clearPendingCommand, activateVoiceMode]);

  // ─── MODE SWITCH EFFECT ───────────────────────────────────────────────────
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    if (isVoiceModeActive) {
      stopBackgroundWatcher();
      if (conversationState === 'LISTENING') {
        startActiveListener();
      }
    } else {
      stopActiveListener();
      if (wakeWordEnabled) {
        const t = setTimeout(() => startBackgroundWatcher(), 200);
        return () => clearTimeout(t);
      }
    }
  }, [isVoiceModeActive, conversationState, wakeWordEnabled, startActiveListener, stopActiveListener, startBackgroundWatcher, stopBackgroundWatcher]);

  // ─── INIT EFFECT ──────────────────────────────────────────────────────────
  useEffect(() => {
    // Try proactive init on mount
    initMicPermission();

    // Also init on first user gesture (click, key, touch)
    const onGesture = () => {
      initMicPermission();
      if (wakeWordEnabledRef.current && !isVoiceModeActiveRef.current && !isWatcherRunningRef.current) {
        startBackgroundWatcher();
      }
    };

    window.addEventListener('click', onGesture, { once: false, passive: true });
    window.addEventListener('keydown', onGesture, { once: false, passive: true });
    window.addEventListener('touchstart', onGesture, { once: false, passive: true });

    return () => {
      window.removeEventListener('click', onGesture);
      window.removeEventListener('keydown', onGesture);
      window.removeEventListener('touchstart', onGesture);
    };
  }, [initMicPermission, startBackgroundWatcher]);

  // ─── CLEANUP ──────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopBackgroundWatcher();
      stopActiveListener();
      clearTimers();
    };
  }, [stopBackgroundWatcher, stopActiveListener, clearTimers]);

  return {
    isSupported: !!SpeechRecognitionAPI,
    initMicPermission,
    processTurn,
    startActiveListener,
    stopActiveListener,
    activateDirectly,
  };
};

export default useVoiceAssistant;
