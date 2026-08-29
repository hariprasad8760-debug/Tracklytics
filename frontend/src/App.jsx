/**
 * ============================================================================
 * FILE: src/App.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   `App.jsx` serves as the top-level React component. It is responsible for 
 *   providing global state providers (SidebarProvider, VoiceProvider, BrowserRouter) 
 *   to the entire component hierarchy.
 *
 * WHAT THIS FILE DOES:
 *   1. Wraps application tree in `BrowserRouter` for client-side routing.
 *   2. Wraps layout tree in `SidebarProvider` for drawer state management.
 *   3. Wraps layout tree in `VoiceProvider` for global voice assistant state.
 *   4. Mounts `VoiceOrchestrator` (starts background wake word watcher).
 *   5. Mounts `VoicePopup` globally (renders over all pages when activated).
 *   6. Renders `AppRoutes`.
 * ============================================================================
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SidebarProvider } from './context/SidebarContext';
import { VoiceProvider } from './context/VoiceContext';
import AppRoutes from './routes/AppRoutes';
import VoiceOrchestrator from './components/voice/VoiceOrchestrator';
import VoicePopup from './components/voice/VoicePopup';

export function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <VoiceProvider>
          {/* Background wake-word listener — invisible, always running */}
          <VoiceOrchestrator />
          {/* Global voice popup — appears over any page when voice mode is active */}
          <VoicePopup />
          {/* All app pages */}
          <AppRoutes />
        </VoiceProvider>
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;
