import { useMemo } from "react";
import { useCachedFirestoreDoc } from "./useCachedFirestoreDoc";
import { useCachedUsernames } from "./useCachedUsernames";
import { CACHE_TTL } from "../lib/memoryCache";

const DEFAULT_RECOMMENDATIONS = { movies: [], episodes: [] };

export function useRecommendations(userId) {
  const {
    data: rawData,
    loading: docLoading,
    error: docError,
    refresh,
  } = useCachedFirestoreDoc(
    "recommendations",
    userId,
    DEFAULT_RECOMMENDATIONS,
    CACHE_TTL.firestore
  );

  const recommendations = useMemo(() => {
    if (!rawData) return DEFAULT_RECOMMENDATIONS;
    return {
      movies: rawData.movies || [],
      episodes: rawData.episodes || [],
    };
  }, [rawData]);

  const recommenderIds = useMemo(
    () => [
      ...recommendations.movies.map((movie) => movie.recommendedBy),
      ...recommendations.episodes.map((episode) => episode.recommendedBy),
    ],
    [recommendations]
  );

  const { usernames: userUsernames, loading: usernamesLoading } =
    useCachedUsernames(recommenderIds);

  const loading = docLoading || (recommenderIds.length > 0 && usernamesLoading);

  return {
    recommendations,
    userUsernames,
    loading,
    error: docError,
    refresh,
  };
}
