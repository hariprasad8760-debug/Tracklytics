/**
 * ============================================================================
 * FILE: src/components/voice/VoiceOrchestrator.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   The useVoiceAssistant hook must be mounted at the top of the app (inside
 *   VoiceProvider) so it keeps running regardless of which page the user is on.
 *   This component initializes the hook safely within an internal error boundary.
 * ============================================================================
 */

import React, { Component } from 'react';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';

class VoiceErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[Voice Assistant] Error boundary caught audio error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const VoiceRunner = () => {
  useVoiceAssistant();
  return null;
};

export const VoiceOrchestrator = () => {
  return (
    <VoiceErrorBoundary>
      <VoiceRunner />
    </VoiceErrorBoundary>
  );
};

export default VoiceOrchestrator;
