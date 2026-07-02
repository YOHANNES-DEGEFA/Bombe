import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import { useCachedFirestoreDoc } from "./useCachedFirestoreDoc";
import { getCachedUser } from "../lib/cachedUsers";
import { CACHE_TTL, getMemoryCached } from "../lib/memoryCache";
import { getUserFacingMessage, logAppError } from "../lib/userFacingError";

const DEFAULT_HISTORY = { movies: [], episodes: [] };
const DEFAULT_FAVORITES = { movies: [], episodes: [], shows: [] };
const DEFAULT_FRIENDS = { friends: [] };

function calculateTopGenre(historyData, genreMap) {
  const genreCounts = {};
  const allHistoryItems = [
    ...(historyData.movies || []),
    ...(historyData.episodes || []),
  ];

  allHistoryItems.forEach((item) => {
    if (!item) return;

    let itemGenreIds = [];
    if (Array.isArray(item.genre_ids) && item.genre_ids.length > 0) {
      itemGenreIds = item.genre_ids.filter((id) => typeof id === "number");
    } else if (Array.isArray(item.genres) && item.genres.length > 0) {
      itemGenreIds = item.genres.map((genre) => genre?.id).filter((id) => typeof id === "number");
    }

    itemGenreIds.forEach((genreId) => {
      if (genreId) {
        genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
      }
    });
  });

  if (Object.keys(genreCounts).length === 0) return "N/A";

  const topGenreId = Object.keys(genreCounts).reduce((a, b) =>
    genreCounts[a] > genreCounts[b] ? a : b
  );
  return genreMap[topGenreId] || "Other";
}

export function useProfileData(genreMap) {
  const { user: currentUser, loading: authLoading } = useAuth();
  const userId = currentUser?.uid ?? null;

  const { data: historyData, loading: historyLoading } = useCachedFirestoreDoc(
    "history",
    userId,
    DEFAULT_HISTORY,
    CACHE_TTL.firestore
  );
  const { data: favoritesData, loading: favoritesLoading } = useCachedFirestoreDoc(
    "favorites",
    userId,
    DEFAULT_FAVORITES,
    CACHE_TTL.firestore
  );
  const { data: friendsData, loading: friendsLoading } = useCachedFirestoreDoc(
    "friends",
    userId,
    DEFAULT_FRIENDS,
    CACHE_TTL.firestore
  );

  const [userData, setUserData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(() => {
    if (!userId) return false;
    return !getMemoryCached(`user:${userId}`, CACHE_TTL.userProfile);
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      setProfileLoading(false);
      return;
    }

    let isMounted = true;
    setProfileLoading(true);
    setError(null);

    getCachedUser(userId)
      .then((profile) => {
        if (!isMounted) return;
        if (!profile) {
          setError("User data not found.");
          return;
        }
        setUserData(profile);
      })
      .catch((err) => {
        logAppError("profile", err);
        if (!isMounted) return;
        setError(
          getUserFacingMessage(err, "We couldn't load your profile. Please try again.")
        );
      })
      .finally(() => {
        if (isMounted) setProfileLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [authLoading, userId]);

  const stats = useMemo(() => {
    const history = historyData || DEFAULT_HISTORY;
    const favorites = favoritesData || DEFAULT_FAVORITES;
    const friends = friendsData || DEFAULT_FRIENDS;

    return {
      buddies: friends.friends?.length || 0,
      moviesWatched: history.movies?.length || 0,
      episodesWatched: history.episodes?.length || 0,
      topGenre: calculateTopGenre(history, genreMap),
      favoriteMovies: favorites.movies?.length || 0,
      favoriteEpisodes: favorites.episodes?.length || 0,
      favoriteShows: favorites.shows?.length || 0,
    };
  }, [historyData, favoritesData, friendsData, genreMap]);

  const loading =
    authLoading ||
    profileLoading ||
    (userId && (historyLoading || favoritesLoading || friendsLoading));

  return {
    currentUser,
    userData,
    setUserData,
    stats,
    loading,
    error,
  };
}
