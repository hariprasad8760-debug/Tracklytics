/**
 * ============================================================================
 * FILE: src/services/voiceIntentService.js
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   High-speed, robust natural language Voice Intent Parser & Navigation Handler.
 *   Converts any conversational phrase (e.g. "go to study block", "open expense slot",
 *   "show analytics", "take me to home") into structured navigation intents with
 *   crisp voice feedback (Text-to-Speech).
 * ============================================================================
 */

// Navigation Intent Registry
const NAVIGATION_ROUTES = [
  {
    target: '/',
    label: 'Dashboard',
    feedback: 'Opening Dashboard.',
    keywords: ['dashboard', 'home', 'overview', 'landing', 'main', 'main menu', 'home page', 'home block'],
    patterns: [
      /dashboard/i,
      /\bhome\b/i,
      /overview/i,
      /landing/i,
      /main\s*(menu|screen|page|block)?/i,
    ],
  },
  {
    target: '/expense',
    label: 'Expenses',
    feedback: 'Opening Expenses.',
    keywords: ['expense', 'expenses', 'spending', 'spendings', 'transaction', 'transactions', 'money', 'cost', 'costs', 'budget'],
    patterns: [
      /expens(e|es)/i,
      /spending[s]?/i,
      /transaction[s]?/i,
      /\bmoney\b/i,
      /\bcost[s]?\b/i,
      /\bbudget[s]?\b/i,
    ],
  },
  {
    target: '/study',
    label: 'Study Tracker',
    feedback: 'Opening Study Tracker.',
    keywords: ['study', 'studies', 'pomodoro', 'focus', 'session', 'sessions', 'timer', 'goal', 'goals', 'subject', 'subjects'],
    patterns: [
      /stud(y|ies|ying)/i,
      /pomodoro/i,
      /\bfocus\b/i,
      /session[s]?/i,
      /\btimer[s]?\b/i,
      /goal[s]?/i,
      /subject[s]?/i,
    ],
  },
  {
    target: '/analytics',
    label: 'Analytics',
    feedback: 'Opening Analytics.',
    keywords: ['analytics', 'analytic', 'analysis', 'insight', 'insights', 'chart', 'charts', 'stat', 'stats', 'statistics', 'graph', 'graphs', 'trend', 'trends'],
    patterns: [
      /analytic[s]?/i,
      /analysis/i,
      /insight[s]?/i,
      /chart[s]?/i,
      /stat(s|istics)/i,
      /graph[s]?/i,
      /trend[s]?/i,
    ],
  },
  {
    target: '/calendar',
    label: 'Calendar',
    feedback: 'Opening Calendar.',
    keywords: ['calendar', 'schedule', 'event', 'events', 'agenda', 'planner', 'timetable'],
    patterns: [
      /calendar/i,
      /schedule[s]?/i,
      /event[s]?/i,
      /agenda/i,
      /planner/i,
      /timetable/i,
    ],
  },
  {
    target: '/reports',
    label: 'Reports',
    feedback: 'Opening Reports.',
    keywords: ['report', 'reports', 'summary', 'export', 'download', 'downloads', 'statement', 'statements'],
    patterns: [
      /report[s]?/i,
      /summary/i,
      /export[s]?/i,
      /download[s]?/i,
      /statement[s]?/i,
    ],
  },
  {
    target: '/settings',
    label: 'Settings',
    feedback: 'Opening Settings.',
    keywords: ['settings', 'setting', 'preference', 'preferences', 'config', 'configuration', 'wake word'],
    patterns: [
      /setting[s]?/i,
      /preference[s]?/i,
      /config(uration)?/i,
      /wake\s*word/i,
    ],
  },
  {
    target: '/auth',
    label: 'Account',
    feedback: 'Opening Account.',
    keywords: ['account', 'profile', 'user', 'login', 'sign in', 'auth', 'authentication'],
    patterns: [
      /\baccount[s]?\b/i,
      /\bprofile[s]?\b/i,
      /\buser[s]?\b/i,
      /log\s*in/i,
      /sign\s*in/i,
      /auth(entication)?/i,
    ],
  },
  {
    target: 'BACK',
    label: 'Previous Page',
    feedback: 'Going back.',
    keywords: ['back', 'go back', 'previous', 'previous page', 'return'],
    patterns: [
      /(go|take\s*me)?\s*back/i,
      /previous(\s*page|\s*screen)?/i,
      /\breturn\b/i,
    ],
  },
];

/**
 * Natural language intent parser
 * Converts spoken transcript -> structured intent
 *
 * @param {string} rawTranscript - The live/final speech string from the user
 * @param {string} [wakeWord='MAPLA'] - The active wake word to strip if present
 * @returns {{ type: 'NAVIGATE'|'UNKNOWN', target?: string, label?: string, feedback: string, confidence?: number }}
 */
export function parseVoiceIntent(rawTranscript, wakeWord = 'MAPLA') {
  if (!rawTranscript || typeof rawTranscript !== 'string') {
    return {
      type: 'UNKNOWN',
      feedback: "I didn't understand the navigation command. Please try again.",
    };
  }

  // 1. Normalize: remove wake word, special characters, extra spaces
  let cleanText = rawTranscript
    .replace(new RegExp(`\\b${wakeWord}\\b`, 'gi'), '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  if (!cleanText) {
    return {
      type: 'UNKNOWN',
      feedback: "I didn't understand the navigation command. Please try again.",
    };
  }

  // 2. Strip conversational prefixes ("take me to", "can you open", "i want to see", "go to", etc.)
  const fillerPrefixes = [
    /^(please|hey|hi|hello|can you|could you|would you|just|now|kindly|ok|okay)\s+/i,
    /^(take me to|take me|show me|show my|show|view|look at|check|display)\s+/i,
    /^(i want to see|i want to go to|i want to open|i want to view|i want to track|i'd like to see|i want to)\s+/i,
    /^(go to|navigate to|open up|open|switch to|switch|move to|jump to|head to|redirect to)\s+/i,
    /^(the\s+)?(page|screen|section|tab|view|block|slot|module|box)\s+(for|of)?\s+/i,
  ];

  let stripped = cleanText;
  let changed = true;
  while (changed) {
    changed = false;
    for (const prefix of fillerPrefixes) {
      if (prefix.test(stripped)) {
        stripped = stripped.replace(prefix, '').trim();
        changed = true;
      }
    }
  }

  // 3. Strip conversational suffixes ("block", "blocks", "slot", "page", "section", "screen", "tracker", "box")
  const fillerSuffixes = [
    /\s+(block|blocks|slot|slots|box|boxes|page|pages|screen|screens|tab|tabs|section|sections|module|modules|tracker|trackers|timer|timers|view|views|area|part|please)$/i,
  ];

  let coreText = stripped;
  for (const suffix of fillerSuffixes) {
    coreText = coreText.replace(suffix, '').trim();
  }

  // List of candidate variations to match against
  const candidates = [coreText, stripped, cleanText].filter(Boolean);

  // 4. Pattern matching across routes
  for (const route of NAVIGATION_ROUTES) {
    // Check regex patterns
    for (const pattern of route.patterns) {
      for (const candidate of candidates) {
        if (pattern.test(candidate)) {
          return {
            type: 'NAVIGATE',
            target: route.target,
            label: route.label,
            feedback: route.feedback,
            confidence: 0.95,
          };
        }
      }
    }

    // Check direct keywords & single-word commands
    for (const kw of route.keywords) {
      for (const candidate of candidates) {
        if (candidate === kw || candidate.includes(kw)) {
          return {
            type: 'NAVIGATE',
            target: route.target,
            label: route.label,
            feedback: route.feedback,
            confidence: 0.9,
          };
        }
      }
    }
  }

  // 5. Unrecognized command
  return {
    type: 'UNKNOWN',
    feedback: "I didn't understand the navigation command. Please try again.",
    confidence: 0,
  };
}

/**
 * Text-to-Speech Voice Feedback — now powered by Luna (sweet female voice).
 * Re-exported from lunaVoiceService to maintain backward compatibility.
 */
export { speakVoiceFeedback } from './lunaVoiceService';

