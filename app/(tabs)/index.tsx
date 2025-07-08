import SectionCarousel from "@/components/SectionCarousel";
import SectionModal from "@/components/SectionModal";
import { useMoviesStore, useUserStore } from "@/stores";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "../../constants/icons";
import { MovieGenreMap } from "../../constants/moviegenre";
import { getMovies } from "../../services/getMovies";
import { Movie } from "../../types/movie";

const categories = Object.keys(MovieGenreMap);

const IndexScreen = () => {
  // Zustand stores
  const { 
    userMetadata, 
    watchHistory, 
    isLoading: userLoading, 
    fetchUserMetadata, 
    fetchWatchHistory 
  } = useUserStore();
  
  const {
    nowPlayingMovies,
    nowPlayingLoading,
    upcomingMovies,
    upcomingLoading,
    topRatedMovies,
    topRatedLoading,
    fetchNowPlaying,
    fetchUpcoming,
    fetchTopRated,
    loadMoreNowPlaying,
    loadMoreUpcoming,
    loadMoreTopRated,
  } = useMoviesStore();

  // Local state (keep these local as they're specific to this screen)
  const [selectedCategory, setSelectedCategory] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesPage, setMoviesPage] = useState(1);
  const [moviesHasMore, setMoviesHasMore] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(true);

  const router = useRouter();

  // Fetch movies when category changes (keep this local)
  useEffect(() => {
    setMoviesLoading(true);
    setMoviesPage(1);
    setMoviesHasMore(true);
    const fetchMovies = async () => {
      try {
        const genreId = selectedCategory
          ? MovieGenreMap[selectedCategory]
          : undefined;
        const response = await getMovies({
          sortBy: "popularity.desc",
          genreId,
          page: 1,
        });
        setMovies(response.results || []);
        setMoviesHasMore(
          response.total_pages
            ? 1 < response.total_pages
            : (response.results?.length ?? 0) > 0
        );
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      }
      setMoviesLoading(false);
    };
    fetchMovies();
  }, [selectedCategory]);

  // Fetch watch history when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchWatchHistory().catch(error => {
        // Handle error silently
      });
    }, [fetchWatchHistory])
  );

  // Fetch initial data on mount
  useEffect(() => {
    // Fetch user data (non-blocking)
    fetchUserMetadata().catch(error => {
      // Handle error silently
    });
    
    // Fetch essential movie data
    fetchNowPlaying();
    fetchUpcoming();
    fetchTopRated();
  }, [fetchUserMetadata, fetchNowPlaying, fetchUpcoming, fetchTopRated]);

  //handle infinite scroll for movies (keep this local)
  const handleLoadMoreMovies = async () => {
    if (moviesLoading || !moviesHasMore) return;

    setMoviesLoading(true);
    try {
      const genreId = selectedCategory
        ? MovieGenreMap[selectedCategory]
        : undefined;
      const nextPage = moviesPage + 1;
      const response = await getMovies({
        sortBy: "popularity.desc",
        genreId,
        page: nextPage,
      });

      setMovies((prev) => [...prev, ...(response.results || [])]);
      setMoviesPage(nextPage);

      setMoviesHasMore(
        response.total_pages
          ? nextPage < response.total_pages
          : (response.results?.length ?? 0) > 0
      );
    } catch (error) {
      console.error("Failed to load more movies:", error);
    }
    setMoviesLoading(false);
  };

  // Use Zustand action for now playing infinite scroll
  const handleLoadMoreNowPlaying = () => {
    loadMoreNowPlaying();
  };

  //wrap the item component in React.memo to prevent unnecessary re-renders
  const MovieItem = React.memo(({ item, onPress }: { item: Movie; onPress: () => void }) => (
    <TouchableOpacity
      className="w-1/3 p-2"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
        className="w-full h-60 rounded-lg"
        resizeMode="cover"
      />
      <Text className="text-white mt-2" numberOfLines={2}>
        {item.title}
      </Text>
      <Text className="text-gray-400 text-sm">
        {item.release_date ? item.release_date.split("-")[0] : "Unknown"}
      </Text>
      <View className="flex-row items-center mt-1">
        <Image
          source={icons.star}
          className="w-4 h-4 mr-1"
          resizeMode="contain"
        />
        <Text className="text-yellow-400">
          {item.vote_average ? item.vote_average.toFixed(1) : "N/A"}
        </Text>
      </View>
    </TouchableOpacity>
  ));
  
  MovieItem.displayName = 'MovieItem';

  // Main loading is TRUE only for essential movie data, not user data
  const loading =
    moviesLoading ||
    (nowPlayingLoading && nowPlayingMovies.length === 0) ||
    (upcomingLoading && upcomingMovies.length === 0) ||
    (topRatedLoading && topRatedMovies.length === 0);

  // Debug logging - removed for production
  useEffect(() => {
    // Debug info removed
  }, []);

  // ---- Header Rendering ----
  const renderHeader = () => (
    <View>
      {userMetadata && (
        <View className="flex-row items-center justify-between px-5 py-4 bg-[#232732] rounded-3xl shadow-lg mx-3 mt-4">
          {/* Left: Welcome text */}
          <View>
            <Text className="text-gray-400 text-base font-inter">
              Welcome 👋
            </Text>
            <Text className="text-white text-xl font-inter mt-1">
              {userMetadata.name}
            </Text>
          </View>

          {/* Right: Profile avatar */}
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            activeOpacity={0.7}
            className="ml-4"
            style={{}}
          >
            <Image
              source={icons.homeProfile}
              className="w-14 h-14 rounded-full"
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Recently Viewed */}
      {watchHistory.length > 0 && (
        <SectionCarousel
          title="Recently Viewed Movies"
          movies={watchHistory}
          listType="watchHistory"
          onPressMovie={(movie) =>
            router.push({
              pathname: "../movie/[id]" as const,
              params: { id: String(movie.id) },
            })
          }
        />
      )}

      {/* Now Playing */}
      {nowPlayingMovies.length > 0 && (
        <SectionCarousel
          title="Now Playing"
          movies={nowPlayingMovies}
          listType="nowPlaying"
          onEndReached={handleLoadMoreNowPlaying}
          moviesLoading={nowPlayingLoading}
          onPressMovie={(movie) =>
            router.push({
              pathname: "../movie/[id]" as const,
              params: { id: String(movie.id) },
            })
          }
        />
      )}

      {/* Upcoming Movies */}
      {upcomingMovies.length > 0 && (
        <SectionCarousel
          title="Upcoming Movies"
          movies={upcomingMovies}
          listType="upcoming"
          onPressMovie={(movie) =>
            router.push({
              pathname: "../movie/[id]" as const,
              params: { id: String(movie.id) },
            })
          }
        />
      )}

      {/* Top Rated Movies */}
      {topRatedMovies.length > 0 && (
        <SectionCarousel
          title="Top Rated Movies"
          movies={topRatedMovies}
          listType="topRated"
          onPressMovie={(movie) =>
            router.push({
              pathname: "../movie/[id]" as const,
              params: { id: String(movie.id) },
            })
          }
        />
      )}

      {/* Categories */}
      {movies.length > 0 && (
        <View className="p-4">
          <Text className="text-white text-lg font-inter">Categories</Text>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  item !== selectedCategory
                    ? setSelectedCategory(item)
                    : setSelectedCategory("")
                }
                activeOpacity={0.6}
                className={`p-3 mr-2 rounded-lg ${
                  selectedCategory === item ? "bg-[#FF8700]" : "bg-[#2C2C2E]"
                }`}
              >
                <Text
                  className={
                    selectedCategory === item
                      ? "text-black font-bold"
                      : "text-white"
                  }
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            className="py-5"
          />
        </View>
      )}
    </View>
  );

  // ---- Main Return ----
  return (
    <SafeAreaView className="flex-1 bg-[#181A20]">
      <FlatList
        data={movies}
        keyExtractor={(item) => `movie-${item.id}`}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 150 }}
        className="mb-10"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MovieItem
            item={item}
            onPress={() =>
              router.push({
                pathname: "../movie/[id]" as const,
                params: { id: String(item.id) },
              })
            }
          />
        )}
        onEndReached={handleLoadMoreMovies}
        onEndReachedThreshold={0.6}
        ListFooterComponent={
          moviesLoading ? (
            <View className="flex-1 items-center justify-center mt-4">
              <ActivityIndicator size="large" color="#FF8700" />
            </View>
          ) : null
        }
        ListEmptyComponent={() =>
          loading ? (
            <View className="flex-1 items-center justify-center mt-10">
              <ActivityIndicator size="large" color="#FF8700" />
              <Text className="text-white mt-4">Loading movies...</Text>
            </View>
          ) : (
            <Text className="text-white text-center mt-8">No movies found</Text>
          )
        }
      />
      
      {/* Global Section Modal - managed through Zustand */}
      <SectionModal
        onSelectMovie={(movie) =>
          router.push({
            pathname: "../movie/[id]" as const,
            params: { id: String(movie.id) },
          })
        }
      />
    </SafeAreaView>
  );
};

export default IndexScreen;
