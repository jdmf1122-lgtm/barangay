import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';

const LOCAL_STORAGE_USER_KEY = 'bconnect_roxas_user_v11';
const LOCAL_STORAGE_THEME_KEY = 'bconnect_theme';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface UIState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
  toggleTheme: () => void;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isNewCaseModalOpen: boolean;
  setIsNewCaseModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCreateAccountModalOpen: boolean;
  setIsCreateAccountModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEditAccountModalOpen: boolean;
  setIsEditAccountModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userToEdit: User | null;
  setUserToEdit: React.Dispatch<React.SetStateAction<User | null>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  filterBarangay: string;
  setFilterBarangay: React.Dispatch<React.SetStateAction<string>>;
  filterStatus: string;
  setFilterStatus: React.Dispatch<React.SetStateAction<string>>;
  filterCategory: string;
  setFilterCategory: React.Dispatch<React.SetStateAction<string>>;
  filterOfficialInvolved: 'ALL' | 'YES' | 'NO';
  setFilterOfficialInvolved: React.Dispatch<React.SetStateAction<'ALL' | 'YES' | 'NO'>>;
  filterAgency: string;
  setFilterAgency: React.Dispatch<React.SetStateAction<string>>;
}

export const UIContext = createContext<UIState | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode; currentUser?: User | null }> = ({ children, currentUser }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as ThemeMode) || 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen to system preference changes (reactive to OS changes)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && systemIsDark);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      if (newTheme === 'system') {
        localStorage.removeItem(LOCAL_STORAGE_THEME_KEY);
      } else {
        localStorage.setItem(LOCAL_STORAGE_THEME_KEY, newTheme);
      }
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // Sync theme to document root and meta color-scheme
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const metaTheme = document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement | null;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      if (metaTheme) metaTheme.content = theme === 'system' ? 'light dark' : 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      if (metaTheme) metaTheme.content = theme === 'system' ? 'light dark' : 'light';
    }
  }, [isDark, theme]);

  // Sync theme changes across browser tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_THEME_KEY) {
        setThemeState((e.newValue as ThemeMode) || 'system');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState<boolean>(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState<boolean>(false);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterBarangay, setFilterBarangay] = useState<string>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if ((u?.agencyType === 'MDRRMO' || u?.agencyType === 'BARANGAY') && u.barangay) return u.barangay;
      } catch {}
    }
    return 'ALL';
  });
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterOfficialInvolved, setFilterOfficialInvolved] = useState<'ALL' | 'YES' | 'NO'>('ALL');
  const [filterAgency, setFilterAgency] = useState<string>('ALL');

  // Auto-align filterBarangay whenever active user changes
  useEffect(() => {
    if ((currentUser?.agencyType === 'MDRRMO' || (currentUser?.agencyType as string) === 'BARANGAY') && currentUser.barangay) {
      setFilterBarangay(currentUser.barangay);
    }
  }, [currentUser]);

  return (
    <UIContext.Provider value={{
      theme, setTheme,
      isDark, toggleTheme,
      activeTab, setActiveTab,
      isMobileMenuOpen, setIsMobileMenuOpen,
      isNewCaseModalOpen, setIsNewCaseModalOpen,
      isCreateAccountModalOpen, setIsCreateAccountModalOpen,
      isEditAccountModalOpen, setIsEditAccountModalOpen,
      userToEdit, setUserToEdit,
      searchQuery, setSearchQuery,
      filterBarangay, setFilterBarangay,
      filterStatus, setFilterStatus,
      filterCategory, setFilterCategory,
      filterOfficialInvolved, setFilterOfficialInvolved,
      filterAgency, setFilterAgency
    }}>
      {children}
    </UIContext.Provider>
  );
};
