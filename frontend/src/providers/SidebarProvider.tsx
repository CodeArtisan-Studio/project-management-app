'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface SidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  isOpen: false,
  toggle: () => undefined,
  close: () => undefined,
  isCollapsed: false,
  toggleCollapse: () => undefined,
});

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggle = useCallback((): void => {
    setIsOpen((prev) => !prev);
  }, []);

  const close = useCallback((): void => {
    setIsOpen(false);
  }, []);

  const toggleCollapse = useCallback((): void => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close, isCollapsed, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  return useContext(SidebarContext);
}
