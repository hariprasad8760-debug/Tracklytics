/**
 * ============================================================================
 * FILE: src/context/VoiceContext.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Provides global Voice Assistant state so any component (Header mic button,
 *   settings page, wake word detector) can read and control voice mode without
 *   prop drilling.
 *
 * WHAT THIS FILE DOES:
 *   1. Stores wakeWord (read from localStorage, default "MAPLA")
 *   2. Stores isVoiceModeActive — whether the popup is visible and listening
 *   3. Stores transcript — live speech-to-text text
 *   4. Stores micPermission — 'unknown' | 'granted' | 'denied'
 *   5. Exposes activateVoiceMode(), deactivateVoiceMode(), updateWakeWord()
 * ============================================================================
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const VoiceContext = createContext(null);

const STORAGE_KEY = 'tracklytics_wake_word';
const DEFAULT_WAKE_WORD = 'MAPLA';

export const VoiceProvider = ({ children }) => {
  // Read wake word from localStorage on first render
  const [wakeWord, setWakeWord] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_WAKE_WORD;
    } catch {
      return DEFAULT_WAKE_WORD;
    }
  });

  // Whether wake word detection is enabled
  const [wakeWordEnabled, setWakeWordEnabled] = useState(() => {
    try {
      return localStorage.getItem('tracklytics_wake_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  // Whether the listening popup is open
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);

  // Live speech transcript shown in popup
  const [transcript, setTranscript] = useState('');

  // Microphone permission state
  const [micPermission, setMicPermission] = useState('unknown'); // 'unknown' | 'granted' | 'denied'

  // Whether it is actively listening (recording audio)
  const [isListening, setIsListening] = useState(false);

  // Activate Voice Mode (called when wake word detected or mic button clicked)
  const activateVoiceMode = useCallback(() => {
    setIsVoiceModeActive(true);
    setTranscript('');
  }, []);

  // Deactivate Voice Mode (close popup, stop listening)
  const deactivateVoiceMode = useCallback(() => {
    setIsVoiceModeActive(false);
    setTranscript('');
    setIsListening(false);
  }, []);

  // Update transcript from speech recognition
  const updateTranscript = useCallback((text) => {
    setTranscript(text);
  }, []);

  // Change wake word and persist to localStorage
  const updateWakeWord = useCallback((newWord) => {
    const normalized = newWord.trim().toUpperCase();
    if (!normalized) return;
    setWakeWord(normalized);
    try {
      localStorage.setItem(STORAGE_KEY, normalized);
    } catch { /* ignore */ }
  }, []);

  // Toggle wake word detection on/off
  const toggleWakeWordEnabled = useCallback((val) => {
    setWakeWordEnabled(val);
    try {
      localStorage.setItem('tracklytics_wake_enabled', String(val));
    } catch { /* ignore */ }
  }, []);

  const value = {
    wakeWord,
    wakeWordEnabled,
    isVoiceModeActive,
    transcript,
    micPermission,
    isListening,
    setMicPermission,
    setIsListening,
    activateVoiceMode,
    deactivateVoiceMode,
    updateTranscript,
    updateWakeWord,
    toggleWakeWordEnabled,
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

export default VoiceContext;
