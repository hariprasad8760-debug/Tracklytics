/**
 * ============================================================================
 * FILE: src/App.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   `App.jsx` serves as the top-level React component. It is responsible for 
 *   providing global state providers (SidebarProvider, BrowserRouter) to the entire 
 *   component hierarchy.
 *
 * WHAT THIS FILE DOES:
 *   1. Wraps application tree in `BrowserRouter` for client-side routing.
 *   2. Wraps layout tree in `SidebarProvider` for drawer state management.
 *   3. Renders `AppRoutes`.
 * ============================================================================
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SidebarProvider } from './context/SidebarContext';
import AppRoutes from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <AppRoutes />
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;
