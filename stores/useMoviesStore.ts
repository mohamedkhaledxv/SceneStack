import { getMovieList } from '@/services/getMovieLists';
import { Movie } from '@/types/movie';
import { create } from 'zustand';

interface MoviesStore {
  // Now Playing
  nowPlayingMovies: Movie[];
  nowPlayingPage: number;
  nowPlayingHasMore: boolean;
  nowPlayingLoading: boolean;
  nowPlayingLastFetched: number | null;

  // Upcoming Movies
  upcomingMovies: Movie[];
  upcomingPage: number;
  upcomingHasMore: boolean;
  upcomingLoading: boolean;
  upcomingLastFetched: number | null;

  // Top Rated Movies
  topRatedMovies: Movie[];
  topRatedPage: number;
  topRatedHasMore: boolean;
  topRatedLoading: boolean;
  topRatedLastFetched: number | null;

  // Actions
  fetchNowPlaying: (refresh?: boolean) => Promise<void>;
  loadMoreNowPlaying: () => Promise<void>;
  
  fetchUpcoming: (refresh?: boolean) => Promise<void>;
  loadMoreUpcoming: () => Promise<void>;
  
  fetchTopRated: (refresh?: boolean) => Promise<void>;
  loadMoreTopRated: () => Promise<void>;
  
  clearMoviesCache: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useMoviesStore = create<MoviesStore>((set, get) => ({
  // Initial state
  nowPlayingMovies: [],
  nowPlayingPage: 1,
  nowPlayingHasMore: true,
  nowPlayingLoading: false,
  nowPlayingLastFetched: null,

  upcomingMovies: [],
  upcomingPage: 1,
  upcomingHasMore: true,
  upcomingLoading: false,
  upcomingLastFetched: null,

  topRatedMovies: [],
  topRatedPage: 1,
  topRatedHasMore: true,
  topRatedLoading: false,
  topRatedLastFetched: null,

  // Now Playing Actions
  fetchNowPlaying: async (refresh = false) => {
    const state = get();
    const now = Date.now();
    
    // Check if we need to fetch (cache expired or refresh requested)
    if (!refresh && state.nowPlayingLastFetched && 
        (now - state.nowPlayingLastFetched) < CACHE_DURATION &&
        state.nowPlayingMovies.length > 0) {
      return; // Use cached data
    }

    if (state.nowPlayingLoading) return;

    set({ nowPlayingLoading: true });
    try {
      const response = await getMovieList("now_playing", 1);
      set({
        nowPlayingMovies: response.results || [],
        nowPlayingPage: 1,
        nowPlayingHasMore: response.total_pages ? 1 < response.total_pages : false,
        nowPlayingLoading: false,
        nowPlayingLastFetched: now,
      });
    } catch (error) {
      console.error('Failed to fetch now playing movies:', error);
      set({ nowPlayingLoading: false });
    }
  },

  loadMoreNowPlaying: async () => {
    const state = get();
    if (state.nowPlayingLoading || !state.nowPlayingHasMore) {
      return;
    }

    set({ nowPlayingLoading: true });
    
    try {
      const nextPage = state.nowPlayingPage + 1;
      
      const response = await getMovieList("now_playing", nextPage);
      
      if (response && response.results) {
        const newMovies = [...state.nowPlayingMovies, ...response.results];
        
        set({
          nowPlayingMovies: newMovies,
          nowPlayingPage: nextPage,
          nowPlayingHasMore: response.total_pages ? nextPage < response.total_pages : false,
          nowPlayingLoading: false,
        });
      } else {
        set({ nowPlayingLoading: false });
      }
    } catch (error) {
      console.error('Store: Failed to load more now playing movies:', error);
      // Ensure loading state is always reset on error
      set({ nowPlayingLoading: false });
      
      // Don't throw the error to prevent crashes
      return;
    }
  },

  // Upcoming Actions
  fetchUpcoming: async (refresh = false) => {
    const state = get();
    const now = Date.now();
    
    if (!refresh && state.upcomingLastFetched && 
        (now - state.upcomingLastFetched) < CACHE_DURATION &&
        state.upcomingMovies.length > 0) {
      return;
    }

    if (state.upcomingLoading) return;

    set({ upcomingLoading: true });
    try {
      const response = await getMovieList("upcoming", 1);
      set({
        upcomingMovies: response.results || [],
        upcomingPage: 1,
        upcomingHasMore: response.total_pages ? 1 < response.total_pages : false,
        upcomingLoading: false,
        upcomingLastFetched: now,
      });
    } catch (error) {
      console.error('Failed to fetch upcoming movies:', error);
      set({ upcomingLoading: false });
    }
  },

  loadMoreUpcoming: async () => {
    const state = get();
    if (state.upcomingLoading || !state.upcomingHasMore) {
      return;
    }

    set({ upcomingLoading: true });
    
    try {
      const nextPage = state.upcomingPage + 1;
      
      const response = await getMovieList("upcoming", nextPage);
      
      if (response && response.results) {
        const newMovies = [...state.upcomingMovies, ...response.results];
        
        set({
          upcomingMovies: newMovies,
          upcomingPage: nextPage,
          upcomingHasMore: response.total_pages ? nextPage < response.total_pages : false,
          upcomingLoading: false,
        });
      } else {
        set({ upcomingLoading: false });
      }
    } catch (error) {
      console.error('Store: Failed to load more upcoming movies:', error);
      // Ensure loading state is always reset on error
      set({ upcomingLoading: false });
      
      // Don't throw the error to prevent crashes
      return;
    }
  },

  // Top Rated Actions
  fetchTopRated: async (refresh = false) => {
    const state = get();
    const now = Date.now();
    
    if (!refresh && state.topRatedLastFetched && 
        (now - state.topRatedLastFetched) < CACHE_DURATION &&
        state.topRatedMovies.length > 0) {
      return;
    }

    if (state.topRatedLoading) return;

    set({ topRatedLoading: true });
    try {
      const response = await getMovieList("top_rated", 1);
      set({
        topRatedMovies: response.results || [],
        topRatedPage: 1,
        topRatedHasMore: response.total_pages ? 1 < response.total_pages : false,
        topRatedLoading: false,
        topRatedLastFetched: now,
      });
    } catch (error) {
      console.error('Failed to fetch top rated movies:', error);
      set({ topRatedLoading: false });
    }
  },

  loadMoreTopRated: async () => {
    const state = get();
    if (state.topRatedLoading || !state.topRatedHasMore) {
      return;
    }

    set({ topRatedLoading: true });
    
    try {
      const nextPage = state.topRatedPage + 1;
      
      const response = await getMovieList("top_rated", nextPage);
      
      if (response && response.results) {
        const newMovies = [...state.topRatedMovies, ...response.results];
        
        set({
          topRatedMovies: newMovies,
          topRatedPage: nextPage,
          topRatedHasMore: response.total_pages ? nextPage < response.total_pages : false,
          topRatedLoading: false,
        });
      } else {
        set({ topRatedLoading: false });
      }
    } catch (error) {
      console.error('Store: Failed to load more top rated movies:', error);
      // Ensure loading state is always reset on error
      set({ topRatedLoading: false });
      
      // Don't throw the error to prevent crashes
      return;
    }
  },

  clearMoviesCache: () => set({
    nowPlayingMovies: [],
    nowPlayingPage: 1,
    nowPlayingHasMore: true,
    nowPlayingLastFetched: null,
    upcomingMovies: [],
    upcomingPage: 1,
    upcomingHasMore: true,
    upcomingLastFetched: null,
    topRatedMovies: [],
    topRatedPage: 1,
    topRatedHasMore: true,
    topRatedLastFetched: null,
  }),
}));
