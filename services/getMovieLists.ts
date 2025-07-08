// services/getMovieLists.ts
import axios from "axios";

const BASE_URL = 'https://api.themoviedb.org/3/movie';
const BEARER_TOKEN = process.env.EXPO_PUBLIC_API_TOKEN; // Make sure this is set in your .env

// Supported movie list types
export type MovieListType = "now_playing" | "popular" | "top_rated" | "upcoming";

// Create an Axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${BEARER_TOKEN}`,
  },
});

// General fetcher for any movie list
export const getMovieList = async (
  category: MovieListType,
  page: number = 1,
  language: string = 'en-US'
) => {
  try {
    console.log(`API: Fetching ${category} movies, page ${page}`);
    
    if (!BEARER_TOKEN) {
      throw new Error('API Bearer token is not configured');
    }
    
    const response = await api.get(`/${category}?language=${language}&page=${page}`);
    
    if (!response.data) {
      throw new Error('No data received from API');
    }
    
    console.log(`API: Successfully fetched ${category}, page ${page}, results: ${response.data.results?.length || 0}`);
    return response.data; // { results: Movie[], ... }
  } catch (err: any) {
    console.error(`API: Failed to fetch ${category} movie list (page ${page}):`, err);
    
    // Log more details about the error
    if (err.response) {
      console.error('API: Response error:', err.response.status, err.response.data);
    } else if (err.request) {
      console.error('API: Network error - no response received');
    } else {
      console.error('API: Request setup error:', err.message);
    }
    
    throw err;
  }
};
