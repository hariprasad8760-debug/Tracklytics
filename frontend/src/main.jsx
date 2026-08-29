/**
 * ============================================================================
 * FILE: src/main.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   This is the entry point file executed by Vite when starting the application. 
 *   It mounts our root React component tree into the HTML `<div id="root">`.
 *
 * WHAT THIS FILE DOES:
 *   1. Imports global stylesheet `./styles/index.css`.
 *   2. Renders `App` inside React's `StrictMode` container.
 * ============================================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
