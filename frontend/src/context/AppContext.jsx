import React, { createContext, useContext } from 'react';
import { useKiosk } from './KioskContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const kioskState = useKiosk();

  return (
    <AppContext.Provider value={kioskState}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
