/**
 * ============================================================================
 * FILE: src/services/voiceDialogManager.js
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Conversational Dialog Manager for Tracklytics Continuous Voice Mode.
 *
 * WHAT THIS FILE DOES:
 *   1. Maintains multi-turn dialog state machines (e.g., adding an expense step-by-step).
 *   2. Extracts conversational slots (amounts, categories, subjects, durations).
 *   3. Evaluates navigation intents, stop commands, and general queries.
 *   4. Formulates natural assistant responses and determines the next dialog state.
 *   5. Keeps continuous listening active after every turn until the user ends it.
 * ============================================================================
 */

import { parseVoiceIntent } from './voiceIntentService';

// Stop / Exit Phrases
const EXIT_PATTERNS = [
  /\b(stop\s*listening|stop\s*voice|stop)\b/i,
  /\b(exit\s*voice\s*mode|exit\s*voice|exit\s*mode|exit)\b/i,
  /\b(end\s*conversation|end\s*session|end\s*chat)\b/i,
  /\b(close\s*voice\s*assistant|close\s*voice|close\s*assistant|close)\b/i,
  /\b(goodbye|bye\s*bye|bye|quit|dismiss|cancel)\b/i,
];

// Inactivity Affirmation Patterns
const AFFIRM_PATTERNS = [
  /\b(yes|yeah|yep|yup|i['’]?m\s*here|i\s*am\s*here|still\s*here|continue|keep\s*listening|go\s*ahead|sure)\b/i,
];

// Helper to extract numbers / currency amounts from speech
function extractAmount(text) {
  if (!text) return null;
  // Match "$500", "500 dollars", "500", "50.50", "₹500", "500 rupees"
  const match = text.match(/(?:[\$₹£€]?\s*)(\d+(?:\.\d{1,2})?)(?:\s*(?:dollars|bucks|rupees|rs|usd))?/i);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  return null;
}

// Helper to extract duration in hours / minutes
function extractDuration(text) {
  if (!text) return null;
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs|hr)/i);
  const minMatch = text.match(/(\d+)\s*(?:minutes|minute|mins|min)/i);

  if (hourMatch) {
    return `${hourMatch[1]} hours`;
  }
  if (minMatch) {
    return `${minMatch[1]} mins`;
  }
  const numOnly = text.match(/(\d+)/);
  if (numOnly) {
    return `${numOnly[1]} hours`;
  }
  return null;
}

/**
 * Evaluates a user speech turn within the current conversational context.
 *
 * @param {string} rawTranscript - What the user said
 * @param {object|null} activeFlow - Current multi-turn dialog flow (e.g. { type: 'ADD_EXPENSE', step: 'AWAITING_AMOUNT', data: {} })
 * @param {string} [wakeWord='MAPLA'] - Wake word to strip if present
 * @returns {{
 *   type: 'STOP_CONVERSATION' | 'NAVIGATE' | 'DIALOG_RESPONSE' | 'HELP' | 'UNKNOWN',
 *   responseText: string,
 *   targetPath?: string,
 *   nextFlow: object|null,
 *   shouldKeepListening: boolean,
 * }}
 */
export function evaluateConversationTurn(rawTranscript, activeFlow = null, wakeWord = 'MAPLA') {
  if (!rawTranscript || typeof rawTranscript !== 'string') {
    return {
      type: 'DIALOG_RESPONSE',
      responseText: "I'm listening. What would you like to do?",
      nextFlow: activeFlow,
      shouldKeepListening: true,
    };
  }

  // Clean transcript
  let clean = rawTranscript
    .replace(new RegExp(`\\b${wakeWord}\\b`, 'gi'), '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const lower = clean.toLowerCase();

  // ─────────────────────────────────────────────────────────────────────────
  // 1. CHECK STOP / EXIT COMMANDS
  // ─────────────────────────────────────────────────────────────────────────
  for (const pattern of EXIT_PATTERNS) {
    if (pattern.test(lower)) {
      return {
        type: 'STOP_CONVERSATION',
        responseText: 'Ending conversation. Goodbye!',
        nextFlow: null,
        shouldKeepListening: false,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. CHECK INACTIVITY AFFIRMATION ("Are you still there?" -> "Yes")
  // ─────────────────────────────────────────────────────────────────────────
  if (activeFlow && activeFlow.type === 'INACTIVITY_CHECK') {
    for (const pattern of AFFIRM_PATTERNS) {
      if (pattern.test(lower)) {
        return {
          type: 'DIALOG_RESPONSE',
          responseText: "I'm here. What would you like to do?",
          nextFlow: null,
          shouldKeepListening: true,
        };
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. MULTI-TURN DIALOG: ADD EXPENSE FLOW
  // ─────────────────────────────────────────────────────────────────────────
  if (activeFlow && activeFlow.type === 'ADD_EXPENSE') {
    // Step 2: Awaiting Amount
    if (activeFlow.step === 'AWAITING_AMOUNT') {
      const amount = extractAmount(lower);
      if (amount !== null && !isNaN(amount)) {
        return {
          type: 'DIALOG_RESPONSE',
          responseText: 'What was it for?',
          nextFlow: {
            type: 'ADD_EXPENSE',
            step: 'AWAITING_CATEGORY',
            data: { ...activeFlow.data, amount },
          },
          shouldKeepListening: true,
        };
      } else {
        return {
          type: 'DIALOG_RESPONSE',
          responseText: 'Please say an amount, for example: 500 or 50 dollars.',
          nextFlow: activeFlow,
          shouldKeepListening: true,
        };
      }
    }

    // Step 3: Awaiting Category / Description
    if (activeFlow.step === 'AWAITING_CATEGORY') {
      const rawCat = clean || 'General';
      const category = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
      const amount = activeFlow.data?.amount || 0;

      return {
        type: 'DIALOG_RESPONSE',
        responseText: `Got it. ₹${amount} ${category} expense saved.`,
        nextFlow: null, // Flow completed! Ready for next command
        shouldKeepListening: true,
        actionPayload: {
          action: 'CREATE_EXPENSE_PREVIEW',
          amount,
          category,
        },
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. MULTI-TURN DIALOG: ADD STUDY SESSION FLOW
  // ─────────────────────────────────────────────────────────────────────────
  if (activeFlow && activeFlow.type === 'ADD_STUDY') {
    // Step 2: Awaiting Subject
    if (activeFlow.step === 'AWAITING_SUBJECT') {
      const subject = clean || 'General Study';
      return {
        type: 'DIALOG_RESPONSE',
        responseText: 'How many hours did you study?',
        nextFlow: {
          type: 'ADD_STUDY',
          step: 'AWAITING_DURATION',
          data: { ...activeFlow.data, subject },
        },
        shouldKeepListening: true,
      };
    }

    // Step 3: Awaiting Duration
    if (activeFlow.step === 'AWAITING_DURATION') {
      const duration = extractDuration(lower) || clean || '1 hour';
      const rawSubject = activeFlow.data?.subject || 'Study';
      const subject = rawSubject.charAt(0).toUpperCase() + rawSubject.slice(1);

      return {
        type: 'DIALOG_RESPONSE',
        responseText: `Logged ${duration} for ${subject} and saved.`,
        nextFlow: null, // Flow completed! Ready for next command
        shouldKeepListening: true,
        actionPayload: {
          action: 'CREATE_STUDY_PREVIEW',
          subject,
          duration,
        },
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. INITIATING NEW INTENTS (User speaks a fresh command)
  // ─────────────────────────────────────────────────────────────────────────

  // Intent A: "Add expense" (Start Multi-turn or Single-shot)
  if (/\b(add\s*expense|new\s*expense|log\s*expense|record\s*expense|create\s*expense)\b/i.test(lower)) {
    // Check if user spoke single-shot e.g. "Add 500 food expense" or "Add expense 50 for coffee"
    const amount = extractAmount(lower);
    // Strip noise words to get the description/category
    const rawCategory = lower
      .replace(/\b(add|expense|new|log|record|create|for|a|an|the|rupees|rs|inr|dollars|bucks)\b/gi, '')
      .replace(/\b\d+(?:\.\d{1,2})?\b/g, '') // remove the number
      .replace(/\s+/g, ' ')
      .trim();

    if (amount !== null && rawCategory.length > 1) {
      const category = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
      return {
        type: 'DIALOG_RESPONSE',
        responseText: `Got it. ₹${amount} ${category} expense saved.`,
        nextFlow: null,
        shouldKeepListening: true,
        actionPayload: {
          action: 'CREATE_EXPENSE_PREVIEW',
          amount,
          category,
        },
      };
    }

    // Otherwise initiate multi-turn question
    return {
      type: 'DIALOG_RESPONSE',
      responseText: 'Sure. What is the amount?',
      nextFlow: {
        type: 'ADD_EXPENSE',
        step: 'AWAITING_AMOUNT',
        data: {},
      },
      shouldKeepListening: true,
    };
  }

  // Intent B: "Add study session" / "Log study"
  if (/\b(add\s*study|log\s*study|track\s*study|new\s*study|study\s*session)\b/i.test(lower)) {
    // Check single-shot e.g. "Log 2 hours for Spring Boot"
    const duration = extractDuration(lower);
    const cleanedSubject = lower
      .replace(/\b(add|study|log|track|new|session|for|hours?|hrs?|mins?|minutes?|a|an|the)\b/gi, '')
      .replace(/\b\d+(?:\.\d+)?\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const subject = cleanedSubject.length > 1
      ? cleanedSubject.charAt(0).toUpperCase() + cleanedSubject.slice(1)
      : null;

    if (duration && subject) {
      return {
        type: 'DIALOG_RESPONSE',
        responseText: `Logged ${duration} for ${subject} and saved.`,
        nextFlow: null,
        shouldKeepListening: true,
        actionPayload: {
          action: 'CREATE_STUDY_PREVIEW',
          subject,
          duration,
        },
      };
    }

    return {
      type: 'DIALOG_RESPONSE',
      responseText: 'Sure. Which subject did you study?',
      nextFlow: {
        type: 'ADD_STUDY',
        step: 'AWAITING_SUBJECT',
        data: {},
      },
      shouldKeepListening: true,
    };
  }

  // Intent C: Help / Who are you?
  if (/\b(what\s*can\s*you\s*do|help|commands|options|who\s*are\s*you)\b/i.test(lower)) {
    return {
      type: 'HELP',
      responseText: "You can say 'Add expense', 'Log study hours', or navigate to any page like expenses, study, calendar, or analytics.",
      nextFlow: null,
      shouldKeepListening: true,
    };
  }

  // Intent D: Check standard navigation routes
  const navIntent = parseVoiceIntent(rawTranscript, wakeWord);
  if (navIntent.type === 'NAVIGATE') {
    return {
      type: 'NAVIGATE',
      responseText: navIntent.feedback,
      targetPath: navIntent.target,
      label: navIntent.label,
      nextFlow: null,
      shouldKeepListening: true,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. UNRECOGNIZED FALLBACK (Polite, keeps listening)
  // ─────────────────────────────────────────────────────────────────────────
  return {
    type: 'UNKNOWN',
    responseText: "I didn't catch that. You can say 'Add expense', 'Open study', or 'Stop listening'.",
    nextFlow: null,
    shouldKeepListening: true,
  };
}

export default {
  evaluateConversationTurn,
};
