/**
 * ============================================================================
 * FILE: src/services/voiceFeedbackService.js
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   High-Fidelity Natural Voice Audio Engine for Tracklytics.
 *   
 * DESIGN PRINCIPLES:
 *   1. Natural, human-like voice synthesis with normal human pitch (1.0).
 *   2. Instant Web Audio API futuristic chime on wake word activation.
 *   3. Crystal-clear navigation confirmations with responsive, natural pacing.
 *   4. Selects the highest quality natural/neural browser voices automatically.
 * ============================================================================
 */

// Priority list for natural, high-fidelity neural assistant voices
const NATURAL_VOICE_PRIORITY = [
  'Google US English',
  'Google UK English Female',
  'Google UK English Male',
  'Microsoft Jenny Online (Natural)',
  'Microsoft Aria Online (Natural)',
  'Microsoft Guy Online (Natural)',
  'Microsoft Zira',
  'Microsoft David',
  'Samantha',
  'Siri',
  'Karen',
  'Daniel',
  'en-US',
  'en-GB',
];

/**
 * Plays a clean, high-tech futuristic activation chime using Web Audio API.
 * Instant, low-latency, and does not require external audio files.
 */
export function playActivationChime() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Tone 1 (520Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(520, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Tone 2 (780Hz - higher pleasant chime)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(780, now + 0.08);
    gain2.gain.setValueAtTime(0.1, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.28);
  } catch {
    // Ignore audio context autoplay restrictions
  }
}

/**
 * Finds the highest quality natural English voice available in the browser.
 */
export function getBestNaturalVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Try matching priority natural names
  for (const name of NATURAL_VOICE_PRIORITY) {
    const found = voices.find(
      (v) => v.name.toLowerCase().includes(name.toLowerCase()) || v.lang.toLowerCase() === name.toLowerCase()
    );
    if (found) return found;
  }

  // 2. Any English voice
  const englishVoice = voices.find((v) => v.lang.startsWith('en'));
  if (englishVoice) return englishVoice;

  return voices[0] || null;
}

/**
 * Speaks natural assistant feedback using Web SpeechSynthesis.
 *
 * @param {string} text - Spoken feedback (e.g. "Opening Expenses.")
 * @param {object} [options]
 * @param {Function} [options.onEnd] - Callback after speaking
 */
export function speakNaturalVoice(text, options = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
    if (options.onEnd) options.onEnd();
    return;
  }

  const doSpeak = () => {
    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = options.rate ?? 1.05;   // Crisp, fast natural assistant pace
      utterance.pitch = options.pitch ?? 1.0;  // 1.0 = Natural human pitch (no robotic distortion)
      utterance.volume = options.volume ?? 1.0;

      const voice = getBestNaturalVoice();
      if (voice) {
        utterance.voice = voice;
      }

      if (options.onEnd) {
        utterance.onend = () => options.onEnd();
        utterance.onerror = () => options.onEnd();
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[Voice Assistant] TTS warning:', err);
      if (options.onEnd) options.onEnd();
    }
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    doSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak();
    };
    setTimeout(doSpeak, 300);
  }
}

/**
 * Re-exported voice feedback wrapper
 */
export function speakVoiceFeedback(text, onEnd) {
  speakNaturalVoice(text, { onEnd });
}

export default {
  playActivationChime,
  speakNaturalVoice,
  speakVoiceFeedback,
  getBestNaturalVoice,
};
