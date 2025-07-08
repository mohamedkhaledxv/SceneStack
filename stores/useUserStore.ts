import { getUserMetadata } from '@/services/firebase/users';
import { getWatchHistory } from '@/services/firebase/watchHistory';
import { Movie } from '@/types/movie';
import { UserMetadataInterface } from '@/types/user';
import { create } from 'zustand';

interface UserStore {
  // State
  userMetadata: UserMetadataInterface | null;
  watchHistory: Movie[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUserMetadata: (metadata: UserMetadataInterface | null) => void;
  setWatchHistory: (history: Movie[]) => void;
  addToWatchHistory: (movie: Movie) => void;
  fetchUserMetadata: () => Promise<void>;
  fetchWatchHistory: () => Promise<void>;
  clearUserData: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial state
  userMetadata: null,
  watchHistory: [],
  isLoading: false,
  error: null,

  // Actions
  setUserMetadata: (metadata) => set({ userMetadata: metadata }),
  
  setWatchHistory: (history) => set({ watchHistory: history }),
  
  addToWatchHistory: (movie) => {
    const { watchHistory } = get();
    // Remove if already exists and add to beginning
    const filteredHistory = watchHistory.filter(item => item.id !== movie.id);
    set({ watchHistory: [movie, ...filteredHistory] });
  },

  fetchUserMetadata: async () => {
    set({ isLoading: true, error: null });
    try {
      const metadata = await getUserMetadata();
      set({ userMetadata: metadata || null, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch user metadata:', error);
      set({ error: 'Failed to fetch user data', isLoading: false, userMetadata: null });
    }
  },

  fetchWatchHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const history = await getWatchHistory();
      set({ watchHistory: history || [], isLoading: false });
    } catch (error) {
      console.error('Failed to fetch watch history:', error);
      set({ error: 'Failed to fetch watch history', isLoading: false, watchHistory: [] });
    }
  },

  clearUserData: () => set({ 
    userMetadata: null, 
    watchHistory: [], 
    error: null 
  }),

  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
}));
