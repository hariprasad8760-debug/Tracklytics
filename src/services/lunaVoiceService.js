/**
 * ============================================================================
 * FILE: src/services/lunaVoiceService.js
 * ============================================================================
 * Luna — Bright, clear, purely female voice engine for Tracklytics.
 *
 * DESIGN RULES:
 *   - ONLY female voices. No male fallback. Ever.
 *   - If no known female voice found → boost pitch to 1.6 to feminize any voice
 *   - Priority: Google UK English Female > Zira > Jenny > Aria > Samantha > any
 *   - Bright, crisp speech: rate 0.94, pitch 1.45 by default
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// Known female voice name fragments, in priority order
// ─────────────────────────────────────────────────────────────────────────────
const FEMALE_NAMES = [
  'Google UK English Female',   // Chrome — best sounding female
  'Microsoft Zira',             // Windows 10/11 — clear & bright
  'Microsoft Jenny',            // Windows 11 — natural
  'Microsoft Aria',             // Windows 11 — warm
  'Microsoft Michelle',
  'Microsoft Clara',
  'Microsoft Hazel',
  'Samantha',                   // macOS
  'Karen',                      // macOS
  'Moira',                      // macOS
  'Tessa',                      // macOS
  'Veena',
  // Generic fragments (order matters — more specific first)
  'Zira', 'Jenny', 'Aria', 'Allison', 'Ava', 'Susan',
  'Victoria', 'Emma', 'Amy', 'Alice', 'Eva', 'Sara',
  'Elena', 'Linda', 'Maria', 'Anna', 'Nora', 'Fiona',
  'Female', 'female', 'woman', 'Woman',
];

// Explicitly known MALE voices to skip
const MALE_BLOCKLIST = [
  'Google UK English Male',
  'Microsoft David',
  'Microsoft Mark',
  'Microsoft Guy',
  'Alex',     // macOS default male
  'Daniel',   // macOS UK male
  'Fred',     // macOS
  'Tom',      // macOS
  'Male', 'male',
];

/**
 * Selects the brightest, clearest female English voice available.
 * Never falls back to a known male voice.
 * If no female-labeled voice exists, returns any English voice with boosted pitch.
 */
export function selectFemaleVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Filter out known male voices
  const nonMale = voices.filter(
    (v) => !MALE_BLOCKLIST.some((m) => v.name.includes(m))
  );

  // Try priority female names in order
  for (const name of FEMALE_NAMES) {
    const found = nonMale.find(
      (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes(name.toLowerCase())
    );
    if (found) return found;
  }

  // Fallback: any English non-male voice
  const anyEnglish = nonMale.find((v) => v.lang.startsWith('en'));
  if (anyEnglish) return anyEnglish;

  // Last resort: first available non-male voice
  return nonMale[0] || null;
}

/**
 * Core Luna TTS engine.
 * Always uses a female voice with bright, clear settings.
 * If browser voices haven't loaded yet, waits for voiceschanged then speaks.
 *
 * @param {string} text
 * @param {object} [options]
 * @param {number} [options.rate=0.94]   — Speech rate
 * @param {number} [options.pitch=1.45]  — Pitch (1.45 = bright feminine)
 * @param {number} [options.volume=1.0]
 * @param {Function} [options.onEnd]     — Callback after speech ends
 */
export function speakAsLuna(text, options = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (options.onEnd) options.onEnd();
    return;
  }

  const doSpeak = () => {
    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang   = 'en-US';
      utterance.rate   = options.rate   ?? 0.94;
      utterance.volume = options.volume ?? 1.0;

      const femaleVoice = selectFemaleVoice();

      if (femaleVoice) {
        utterance.voice = femaleVoice;
        // If the selected voice is a known natural female voice, normal pitch
        // Otherwise boost pitch further to sound feminine
        const isNaturalFemale = FEMALE_NAMES.some((n) =>
          femaleVoice.name.toLowerCase().includes(n.toLowerCase())
        );
        utterance.pitch = options.pitch ?? (isNaturalFemale ? 1.45 : 1.7);
      } else {
        // No voice at all — max pitch to feminize
        utterance.pitch = 1.8;
      }

      if (options.onEnd) {
        utterance.onend   = () => options.onEnd();
        utterance.onerror = () => options.onEnd();
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[Luna] TTS error:', err);
      if (options.onEnd) options.onEnd();
    }
  };

  // Voices may not be loaded on first call — wait for them
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    doSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak();
    };
    // Safety timeout in case onvoiceschanged never fires
    setTimeout(doSpeak, 500);
  }
}

/**
 * Luna's wake-word greeting.
 * "Hello Hari! I'm Luna. How can I help you today?"
 *
 * @param {string} [username='there']
 * @param {Function} [onEnd]
 */
export function lunaGreet(username = 'there', onEnd) {
  const greeting = `Hello ${username}! I'm Luna. How can I help you today?`;
  speakAsLuna(greeting, {
    rate: 0.90,   // Slightly slower, warmer for greeting
    pitch: 1.5,   // Brighter for greeting
    onEnd,
  });
}

/**
 * Luna navigation confirmation — speaks in a bright female voice.
 *
 * @param {string} text
 * @param {Function} [onEnd]
 */
export function speakVoiceFeedback(text, onEnd) {
  speakAsLuna(text, { onEnd });
}
