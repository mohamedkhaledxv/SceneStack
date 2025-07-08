import { useAppStore, useMoviesStore } from "@/stores";
import { Movie } from "@/types/movie";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, Text, TouchableOpacity, View } from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type MovieListType = 'nowPlaying' | 'upcoming' | 'topRated' | 'watchHistory' | 'other';

interface SectionModalProps {
  onSelectMovie?: (movie: Movie) => void;
}

/// Ultra-safe Movie Item Component
const MovieGridItem = React.memo(({ item, onPress }: { item: Movie; onPress: () => void }) => {
  // Multiple safety checks
  if (!item) {
    return <View style={{ width: '33.33%', padding: 8, height: 240 }} />;
  }

  const imageUri = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
    : null;

  return (
    <TouchableOpacity
      style={{ width: '33.33%', padding: 8 }}
      activeOpacity={0.7}
      onPress={() => {
        try {
          onPress();
        } catch (error) {
          console.error('Error in movie press:', error);
        }
      }}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: 240, borderRadius: 8 }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ 
          width: '100%', 
          height: 240, 
          borderRadius: 8, 
          backgroundColor: '#374151',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{ color: '#9CA3AF' }}>No Image</Text>
        </View>
      )}
      <Text 
        style={{ color: 'white', marginTop: 8, fontSize: 14 }}
        numberOfLines={2}
      >
        {item.title || 'Unknown Title'}
      </Text>
    </TouchableOpacity>
  );
});

export default function SectionModal({ 
  onSelectMovie 
}: SectionModalProps) {
  
  // Get Zustand store states and actions
  const {
    loadMoreNowPlaying,
    loadMoreUpcoming,
    loadMoreTopRated,
    nowPlayingLoading,
    upcomingLoading,
    topRatedLoading,
    nowPlayingMovies,
    upcomingMovies,
    topRatedMovies,
  } = useMoviesStore();
  
  const {
    modalVisible: visible,
    modalListType: listType,
    modalTitle: title,
    closeModal,
  } = useAppStore();
  
  // Get movies directly from store instead of props to prevent crashes
  const getMoviesFromStore = useCallback(() => {
    switch (listType) {
      case 'nowPlaying': return nowPlayingMovies;
      case 'upcoming': return upcomingMovies;
      case 'topRated': return topRatedMovies;
      default: return []; // Return empty array for other types
    }
  }, [listType, nowPlayingMovies, upcomingMovies, topRatedMovies]);
  
  const modalMovies = getMoviesFromStore();
  
  // Get the appropriate loading state based on listType
  const isLoadingMore = (() => {
    switch (listType) {
      case 'nowPlaying': return nowPlayingLoading;
      case 'upcoming': return upcomingLoading;
      case 'topRated': return topRatedLoading;
      default: return false;
    }
  })();
  
  // Log state for debugging
  useEffect(() => {
    // Removed console logs for cleaner production code
  }, [visible, listType, modalMovies?.length, isLoadingMore]);
  
  // Stable callback for movie selection to prevent re-renders
  const handleSelectMovie = useCallback((movie: Movie) => {
    if (onSelectMovie) {
      onSelectMovie(movie);
    }
    closeModal(); // Close modal after selecting a movie
  }, [onSelectMovie, closeModal]);
  
  // Handle end reached - call the appropriate store function directly
  const handleEndReached = useCallback(() => {
    if (isLoadingMore) {
      return;
    }
    
    // Call store functions directly - no intermediate functions
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
        break;
    }
  }, [isLoadingMore, listType, loadMoreNowPlaying, loadMoreUpcoming, loadMoreTopRated]);
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeModal}
    >
      <TouchableOpacity 
        style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          justifyContent: 'flex-end' 
        }}
        activeOpacity={1}
        onPress={closeModal}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          className="bg-[#181A20] rounded-t-3xl px-4 pt-4 pb-6"
          style={{ minHeight: SCREEN_HEIGHT * 0.80, maxHeight: SCREEN_HEIGHT * 0.85 }}
        >
          {/* Drag Handle */}
          <View className="items-center mb-2">
            <View className="w-10 h-1.5 bg-[#333] rounded-full mb-3" />
          </View>
          {/* Header */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-xl font-bold">{title || 'Movies'}</Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {/* 3-Column List - Ultra-safe implementation */}
          <FlatList
            data={modalMovies || []}
            keyExtractor={(item, index) => `modal-movie-${item?.id || index}-${modalMovies?.length || 0}`}
            numColumns={3}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.8} // Higher threshold for more reliability
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            style={{ flex: 1 }}
            removeClippedSubviews={false} // Disable for modal stability
            initialNumToRender={9} // 3x3 grid
            maxToRenderPerBatch={9} // Batch by full rows
            windowSize={3} // Small window
            updateCellsBatchingPeriod={200}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <ActivityIndicator size="large" color="#FF8700" />
                  <Text style={{ color: 'white', marginTop: 8 }}>Loading more...</Text>
                  <Text style={{ color: '#9CA3AF', marginTop: 4, fontSize: 12 }}>
                    Total: {modalMovies?.length || 0} movies
                  </Text>
                </View>
              ) : (
                <View style={{ height: 20 }} />
              )
            }
            renderItem={({ item, index }) => (
              <MovieGridItem 
                key={`item-${item?.id || index}`}
                item={item} 
                onPress={() => handleSelectMovie(item)} 
              />
            )}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
