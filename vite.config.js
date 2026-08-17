/**
 * ============================================================================
 * FILE: vite.config.js
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Vite build and dev server configuration.
 *
 * WHAT THIS FILE DOES:
 *   1. Integrates React plugin (`@vitejs/plugin-react`).
 *   2. Integrates Tailwind CSS plugin (`@tailwindcss/vite`).
 *   3. Configures local development port and hot module replacement (HMR).
 * ============================================================================
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
  },
});
