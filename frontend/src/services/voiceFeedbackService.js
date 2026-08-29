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
 *   3. Crystal-clear navigation and conversational confirmations with responsive pacing.
 *   4. Supports customizable Voice Personas (Female, Male, Natural Assistant).
 *   5. Clean onEnd / onError callback handling to allow continuous conversational loops.
 * ============================================================================
 */

// Voice priority lists for different voice preferences
const FEMALE_VOICE_NAMES = [
  'Google UK English Female',
  'Google US English',
  'Microsoft Jenny Online (Natural)',
  'Microsoft Aria Online (Natural)',
  'Microsoft Zira',
  'Samantha',
  'Karen',
  'Victoria',
  'Zira',
  'Jenny',
  'Aria',
];

const MALE_VOICE_NAMES = [
  'Google UK English Male',
  'Microsoft Guy Online (Natural)',
  'Microsoft David',
  'Microsoft Mark',
  'Daniel',
  'Alex',
  'David',
  'Guy',
];

const NATURAL_VOICE_PRIORITY = [
  'Google US English',
  'Google UK English Female',
  'Microsoft Jenny Online (Natural)',
  'Microsoft Aria Online (Natural)',
  'Microsoft Guy Online (Natural)',
  'Google UK English Male',
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
 * Finds the highest quality voice available in the browser matching the user's preference.
 *
 * @param {'female' | 'male' | 'natural'} [voiceType='female']
 */
export function getBestVoice(voiceType = 'female') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  let searchList = NATURAL_VOICE_PRIORITY;
  if (voiceType === 'female') searchList = FEMALE_VOICE_NAMES;
  else if (voiceType === 'male') searchList = MALE_VOICE_NAMES;

  // 1. Try matching preferred names
  for (const name of searchList) {
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
 * @param {string} text - Spoken feedback (e.g. "Sure. What is the amount?")
 * @param {object} [options]
 * @param {string} [options.voiceType='female'] - 'female' | 'male' | 'natural'
 * @param {number} [options.rate=1.05]
 * @param {number} [options.pitch=1.0]
 * @param {number} [options.volume=1.0]
 * @param {Function} [options.onEnd] - Callback when speech ends
 */
export function speakNaturalVoice(text, options = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
    if (options.onEnd) options.onEnd();
    return;
  }

  let hasEnded = false;
  const finish = () => {
    if (hasEnded) return;
    hasEnded = true;
    if (options.onEnd) {
      options.onEnd();
    }
  };

  const doSpeak = () => {
    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = options.rate ?? 1.05;   // Crisp, fast natural assistant pace
      utterance.pitch = options.pitch ?? (options.voiceType === 'female' ? 1.05 : 1.0);
      utterance.volume = options.volume ?? 1.0;

      const voice = getBestVoice(options.voiceType || 'female');
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = finish;
      utterance.onerror = finish;

      window.speechSynthesis.speak(utterance);

      // Failsafe timeout in case browser TTS onend hangs
      const approxDurationMs = Math.max(1500, (text.length / 15) * 1000 + 1000);
      setTimeout(() => {
        if (!hasEnded && window.speechSynthesis.speaking) {
          // Still speaking normally
        } else if (!hasEnded) {
          finish();
        }
      }, approxDurationMs + 1000);
    } catch (err) {
      console.warn('[Voice Assistant] TTS warning:', err);
      finish();
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
    setTimeout(doSpeak, 250);
  }
}

/**
 * Re-exported voice feedback wrapper
 */
export function speakVoiceFeedback(text, onEnd, voiceType = 'female') {
  speakNaturalVoice(text, { onEnd, voiceType });
}

export default {
  playActivationChime,
  speakNaturalVoice,
  speakVoiceFeedback,
  getBestVoice,
};
