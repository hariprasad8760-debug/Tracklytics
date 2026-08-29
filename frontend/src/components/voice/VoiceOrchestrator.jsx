/**
 * ============================================================================
 * FILE: src/components/voice/VoiceOrchestrator.jsx
 * ============================================================================
 * Mounts useVoiceAssistant at the app root (inside VoiceProvider) so the
 * wake word watcher keeps running across all pages.
 * Also exposes activateDirectly via VoiceContext for the header mic button.
 * ============================================================================
 */

import React, { Component, useEffect } from 'react';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useVoice } from '../../context/VoiceContext';

class VoiceErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[Voice Assistant] Error boundary caught:', error?.message);
    // Reset after 3 seconds so it tries again
    setTimeout(() => this.setState({ hasError: false }), 3000);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const VoiceRunner = () => {
  const { activateDirectly } = useVoiceAssistant();
  const { setActivateDirectly } = useVoice();

  // Expose activateDirectly to the context so Header can call it
  useEffect(() => {
    if (setActivateDirectly && activateDirectly) {
      setActivateDirectly(() => activateDirectly);
    }
  }, [activateDirectly, setActivateDirectly]);

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
