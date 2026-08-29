/**
 * ============================================================================
 * FILE: src/context/VoiceContext.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Central state store for Tracklytics Continuous Conversational Voice Assistant.
 *
 * WHAT THIS FILE STORES:
 *   1. Conversation States: 'IDLE' | 'WAKE_WORD_DETECTED' | 'LISTENING' | 'PROCESSING' | 'ASSISTANT_RESPONDING'
 *   2. Active Multi-Turn Dialog Context (activeFlow)
 *   3. Last spoken Assistant Response text
 *   4. Configuration & User Preferences:
 *      - Wake Word (default: 'MAPLA')
 *      - Continuous Conversation Mode (default: true)
 *      - Inactivity Timeout in seconds (default: 60s)
 *      - Assistant Voice Persona ('female' | 'male' | 'natural')
 *      - Wake Word Detection (default: true)
 * ============================================================================
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const VoiceContext = createContext(null);

const STORAGE_KEYS = {
  WAKE_WORD: 'tracklytics_wake_word',
  WAKE_ENABLED: 'tracklytics_wake_enabled',
  CONTINUOUS_MODE: 'tracklytics_continuous_voice',
  INACTIVITY_SEC: 'tracklytics_voice_inactivity_sec',
  ASSISTANT_VOICE: 'tracklytics_assistant_voice',
};

const DEFAULT_WAKE_WORD = 'MAPLA';
const DEFAULT_INACTIVITY_SEC = 60;

export const VoiceProvider = ({ children }) => {
  // ── 1. Preferences & Settings ─────────────────────────────────────────────

  // Wake Word
  const [wakeWord, setWakeWord] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.WAKE_WORD) || DEFAULT_WAKE_WORD;
    } catch {
      return DEFAULT_WAKE_WORD;
    }
  });

  // Wake Word Detection Toggle
  const [wakeWordEnabled, setWakeWordEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.WAKE_ENABLED) !== 'false';
    } catch {
      return true;
    }
  });

  // Continuous Conversation Mode Toggle (Default: true)
  const [continuousMode, setContinuousMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CONTINUOUS_MODE) !== 'false';
    } catch {
      return true;
    }
  });

  // Inactivity Timeout in Seconds (Default: 60s)
  const [inactivityTimeoutSec, setInactivityTimeoutSec] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INACTIVITY_SEC);
      return stored ? parseInt(stored, 10) : DEFAULT_INACTIVITY_SEC;
    } catch {
      return DEFAULT_INACTIVITY_SEC;
    }
  });

  // Assistant Voice Persona ('female' | 'male' | 'natural')
  const [assistantVoice, setAssistantVoice] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ASSISTANT_VOICE) || 'female';
    } catch {
      return 'female';
    }
  });

  // ── 2. Live Conversation Runtime States ───────────────────────────────────

  // 'IDLE' | 'WAKE_WORD_DETECTED' | 'LISTENING' | 'PROCESSING' | 'ASSISTANT_RESPONDING'
  const [conversationState, setConversationState] = useState('IDLE');

  // Whether the voice indicator is visible on screen
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);

  // Live streaming speech transcript from mic
  const [transcript, setTranscript] = useState('');

  // Active Multi-Turn Dialog Context (e.g. { type: 'ADD_EXPENSE', step: 'AWAITING_AMOUNT', data: {} })
  const [activeFlow, setActiveFlow] = useState(null);

  // Last message spoken by assistant
  const [lastAssistantMessage, setLastAssistantMessage] = useState("I'm listening.");

  // Microphone permission state ('unknown' | 'granted' | 'denied')
  const [micPermission, setMicPermission] = useState('unknown');

  // Ref to activateDirectly function (set by VoiceOrchestrator after hook mounts)
  const activateDirectlyRef = useRef(null);
  const setActivateDirectly = useCallback((fn) => {
    activateDirectlyRef.current = fn;
  }, []);

  // ── 3. State Mutator Callbacks ────────────────────────────────────────────

  // Activate Voice Conversation Mode
  const activateVoiceMode = useCallback((initialText = '', initialGreeting = "I'm listening.") => {
    const cleanText = typeof initialText === 'string' ? initialText : '';
    setIsVoiceModeActive(true);
    setConversationState('LISTENING');
    setTranscript(cleanText);
    setLastAssistantMessage(initialGreeting);
  }, []);

  // Deactivate Voice Mode (End Session)
  const deactivateVoiceMode = useCallback(() => {
    setIsVoiceModeActive(false);
    setConversationState('IDLE');
    setTranscript('');
    setActiveFlow(null);
    setLastAssistantMessage('');
  }, []);

  // Pending user command triggered manually (e.g. from chip click)
  const [pendingCommand, setPendingCommand] = useState('');

  const triggerCommand = useCallback((cmd) => {
    if (cmd && typeof cmd === 'string') {
      setPendingCommand(cmd);
    }
  }, []);

  const clearPendingCommand = useCallback(() => {
    setPendingCommand('');
  }, []);

  // Update live transcript string safely
  const updateTranscript = useCallback((text) => {
    const cleanText = typeof text === 'string' ? text : '';
    setTranscript(cleanText);
  }, []);

  // Update Wake Word
  const updateWakeWord = useCallback((newWord) => {
    const normalized = newWord.trim().toUpperCase();
    if (!normalized) return;
    setWakeWord(normalized);
    try {
      localStorage.setItem(STORAGE_KEYS.WAKE_WORD, normalized);
    } catch { /* ignore */ }
  }, []);

  // Toggle Wake Word Detection
  const toggleWakeWordEnabled = useCallback((val) => {
    setWakeWordEnabled(val);
    try {
      localStorage.setItem(STORAGE_KEYS.WAKE_ENABLED, String(val));
    } catch { /* ignore */ }
  }, []);

  // Toggle Continuous Conversation Mode
  const updateContinuousMode = useCallback((val) => {
    setContinuousMode(val);
    try {
      localStorage.setItem(STORAGE_KEYS.CONTINUOUS_MODE, String(val));
    } catch { /* ignore */ }
  }, []);

  // Update Inactivity Timeout
  const updateInactivityTimeoutSec = useCallback((sec) => {
    const parsed = parseInt(sec, 10) || DEFAULT_INACTIVITY_SEC;
    setInactivityTimeoutSec(parsed);
    try {
      localStorage.setItem(STORAGE_KEYS.INACTIVITY_SEC, String(parsed));
    } catch { /* ignore */ }
  }, []);

  // Update Assistant Voice Persona
  const updateAssistantVoice = useCallback((voice) => {
    setAssistantVoice(voice);
    try {
      localStorage.setItem(STORAGE_KEYS.ASSISTANT_VOICE, voice);
    } catch { /* ignore */ }
  }, []);

  const value = {
    // Preferences
    wakeWord,
    wakeWordEnabled,
    continuousMode,
    inactivityTimeoutSec,
    assistantVoice,
    updateWakeWord,
    toggleWakeWordEnabled,
    updateContinuousMode,
    updateInactivityTimeoutSec,
    updateAssistantVoice,

    // Runtime state
    conversationState,
    isVoiceModeActive,
    transcript,
    activeFlow,
    lastAssistantMessage,
    micPermission,
    pendingCommand,
    setConversationState,
    setIsVoiceModeActive,
    setActiveFlow,
    setLastAssistantMessage,
    setMicPermission,
    activateVoiceMode,
    deactivateVoiceMode,
    updateTranscript,
    triggerCommand,
    clearPendingCommand,

    // Direct activation (set by VoiceOrchestrator after hook mounts)
    activateDirectly: () => activateDirectlyRef.current && activateDirectlyRef.current(),
    setActivateDirectly,

    // Backward compatibility aliases
    isListening: conversationState === 'LISTENING',
    setIsListening: (val) => setConversationState(val ? 'LISTENING' : 'IDLE'),
    wakeWordActive: !isVoiceModeActive, // background watcher is active when voice mode is off
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error('useVoice must be used inside <VoiceProvider>');
  return ctx;
};

export default VoiceProvider;
