//comonent/SectionCarousel.tsx
import { useAppStore, useMoviesStore } from "@/stores";
import { Movie } from "@/types/movie";
import React, { useCallback, useMemo, useRef } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";

type MovieListType = 'nowPlaying' | 'upcoming' | 'topRated' | 'watchHistory' | 'other';

interface SectionCarouselProps {
  title: string;
  movies: Movie[];
  onPressMovie: (movie: Movie) => void;
  onEndReached?: () => void; // For backward compatibility
  moviesLoading?: boolean;
  listType?: MovieListType; // New prop to identify which list type
}

const SectionCarousel: React.FC<SectionCarouselProps> = ({
  title,
  movies,
  onPressMovie,
  onEndReached,
  moviesLoading = false,
  listType = 'other', // Default to 'other' for non-store lists
}) => {
  const lastCallRef = useRef<number>(0);
  
  // Get Zustand store actions for infinite scroll in horizontal carousel only
  const {
    loadMoreNowPlaying,
    loadMoreUpcoming,
    loadMoreTopRated,
    nowPlayingLoading,
    upcomingLoading,
    topRatedLoading,
  } = useMoviesStore();

  // Get modal state and actions from app store
  const { openModal } = useAppStore();

  // Get the appropriate load more function for horizontal carousel only
  const loadMoreFunction = useCallback(() => {
    // More aggressive debouncing - prevent multiple calls within 5 seconds
    const now = Date.now();
    if (lastCallRef.current && (now - lastCallRef.current) < 5000) {
      return;
    }
    lastCallRef.current = now;

    // Check if already loading
    const isLoading = (() => {
      switch (listType) {
        case 'nowPlaying': return nowPlayingLoading;
        case 'upcoming': return upcomingLoading;
        case 'topRated': return topRatedLoading;
        default: return false;
      }
    })();

    if (isLoading) {
      return;
    }

    switch (listType) {
      case 'nowPlaying':
        loadMoreNowPlaying();
        break;
      case 'upcoming':
        loadMoreUpcoming();
        break;
      case 'topRated':
        loadMoreTopRated();
        break;
      default:
        if (onEndReached) {
          onEndReached();
        }
        break;
    }
  }, [listType, loadMoreNowPlaying, loadMoreUpcoming, loadMoreTopRated, onEndReached, nowPlayingLoading, upcomingLoading, topRatedLoading]);

  // Get appropriate loading state
  const getLoadingState = useMemo(() => {
    const loadingState = (() => {
      switch (listType) {
        case 'nowPlaying':
          return nowPlayingLoading;
        case 'upcoming':
          return upcomingLoading;
        case 'topRated':
          return topRatedLoading;
        default:
          return moviesLoading; // Fallback to prop
      }
    })();
    
    return loadingState;
  }, [listType, nowPlayingLoading, upcomingLoading, topRatedLoading, moviesLoading]);

  if (!movies || movies.length === 0) return null;

  return (
    <View className="p-4">
      <Text className="text-white text-lg font-inter mb-2">{title}</Text>
      <TouchableOpacity
        className="absolute right-4 top-4"
        onPress={() => openModal(listType, title)}
        activeOpacity={0.7}
      >
        <Text className="text-[#FF8700] text-sm">View All</Text>
      </TouchableOpacity>
      {/* Horizontal carousel */}
      <FlatList
        data={movies.slice(0, 10)} // show only first 10, change as needed
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id?.toString?.() || String(item.id)}
        onEndReached={loadMoreFunction} // Use Zustand function instead of prop
        onEndReachedThreshold={0.5} 
        ListFooterComponent={
          getLoadingState ? (
            <View className="w-32 h-48 justify-center items-center">
              <ActivityIndicator size="large" color="#FF8700" />
              <Text className="text-white text-xs mt-2">Loading...</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mr-3"
            activeOpacity={0.7}
            onPress={() => onPressMovie(item)}
          >
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
              }}
              className="w-32 h-48 rounded-lg"
              resizeMode="cover"
            />
            <Text className="text-white w-32 flex-shrink mt-2" numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default SectionCarousel;
