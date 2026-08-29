/**
 * ============================================================================
 * FILE: src/context/SidebarContext.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   The sidebar needs to be toggled from both the Sidebar itself and the Header bar 
 *   (e.g., hamburger menu on mobile viewports). React Context allows deep child 
 *   components to share layout state without propeller "prop drilling".
 *
 * WHAT THIS FILE DOES:
 *   1. Creates `SidebarContext` holding `isCollapsed` and `isMobileOpen` state.
 *   2. Provides `SidebarProvider` component to wrap the layout tree.
 *   3. Exports a custom hook `useSidebar()` for consuming context cleanly.
 *
 * FOLDER RESPONSIBILITY (src/context/):
 *   Stores global state providers (UI state, Auth state, Theme settings).
 * ============================================================================
 */

import React, { createContext, useContext, useState } from 'react';

// 1. Create the React Context object
const SidebarContext = createContext(undefined);

/**
 * SidebarProvider Component
 * Wraps the app layout and manages collapsed and mobile drawer states.
 */
export const SidebarProvider = ({ children }) => {
  // Desktop collapse state (icons-only vs expanded with labels)
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Mobile drawer open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Toggle desktop sidebar collapse
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  // Toggle mobile drawer
  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        toggleCollapse,
        toggleMobile,
        closeMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

/**
 * Custom Hook: useSidebar
 * Beginner Tip: Using a custom hook simplifies consuming context in components 
 * and throws a helpful error if used outside of <SidebarProvider>.
 */
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a <SidebarProvider>');
  }
  return context;
};
