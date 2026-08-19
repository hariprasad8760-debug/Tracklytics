/**
 * ============================================================================
 * FILE: src/components/voice/VoiceOrchestrator.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   The useVoiceAssistant hook must be mounted at the top of the app (inside
 *   VoiceProvider) so it keeps running regardless of which page the user is on.
 *   This invisible component simply initializes the hook and renders nothing.
 * ============================================================================
 */

import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';

export const VoiceOrchestrator = () => {
  // This call starts the background wake word watcher
  useVoiceAssistant();
  return null; // renders nothing
};

export default VoiceOrchestrator;
