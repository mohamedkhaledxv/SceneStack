import { create } from 'zustand';

type MovieListType = 'nowPlaying' | 'upcoming' | 'topRated' | 'watchHistory' | 'other';

interface AppStore {
  // App State
  isInitialized: boolean;
  isOnboarded: boolean;
  theme: 'light' | 'dark';
  
  // Notification Settings
  notificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  
  // UI State
  isNetworkConnected: boolean;
  lastSyncTime: number | null;
  
  // Global Error Handling
  globalError: string | null;
  
  // Modal State Management
  modalVisible: boolean;
  modalListType: MovieListType | null;
  modalTitle: string | null;
  
  // Actions
  setInitialized: (initialized: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setPushNotificationsEnabled: (enabled: boolean) => void;
  setNetworkConnected: (connected: boolean) => void;
  setLastSyncTime: (time: number) => void;
  setGlobalError: (error: string | null) => void;
  clearGlobalError: () => void;
  
  // Modal Actions
  openModal: (listType: MovieListType, title: string) => void;
  closeModal: () => void;
  
  resetApp: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Initial state
  isInitialized: false,
  isOnboarded: false,
  theme: 'dark', // Default to dark theme for your movie app
  
  notificationsEnabled: true,
  pushNotificationsEnabled: true,
  
  isNetworkConnected: true,
  lastSyncTime: null,
  
  globalError: null,
  
  // Modal state
  modalVisible: false,
  modalListType: null,
  modalTitle: null,

  // Actions
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  
  setOnboarded: (onboarded) => set({ isOnboarded: onboarded }),
  
  setTheme: (theme) => set({ theme }),
  
  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
  
  setPushNotificationsEnabled: (enabled) => set({ pushNotificationsEnabled: enabled }),
  
  setNetworkConnected: (connected) => set({ isNetworkConnected: connected }),
  
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  
  setGlobalError: (error) => set({ globalError: error }),
  
  clearGlobalError: () => set({ globalError: null }),
  
  openModal: (listType, title) => set({ modalVisible: true, modalListType: listType, modalTitle: title }),
  
  closeModal: () => set({ modalVisible: false, modalListType: null, modalTitle: null }),
  
  resetApp: () => set({
    isInitialized: false,
    isOnboarded: false,
    theme: 'dark',
    notificationsEnabled: true,
    pushNotificationsEnabled: true,
    isNetworkConnected: true,
    lastSyncTime: null,
    globalError: null,
    modalVisible: false,
    modalListType: null,
    modalTitle: null,
  }),
}));