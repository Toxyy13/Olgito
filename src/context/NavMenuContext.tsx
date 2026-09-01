import React, { createContext, useContext } from 'react';

interface NavMenuContextValue {
  open: () => void;
}

const NavMenuContext = createContext<NavMenuContextValue>({ open: () => {} });

export const NavMenuProvider = NavMenuContext.Provider;

export function useNavMenu() {
  return useContext(NavMenuContext);
}
