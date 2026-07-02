import { useEffect, useState } from "react";
import { fetchHomePageData } from "../lib/homeData";
import { CACHE_TTL, getMemoryCached } from "../lib/memoryCache";

const EMPTY_HOME_DATA = {
  heroMovies: [],
  heroShows: [],
  trendingMovies: [],
  highestRatedMovies: [],
  trendingShows: [],
  highestRatedShows: [],
};

export function useHomeData() {
  const cached = getMemoryCached("home:page-data", CACHE_TTL.tmdbTrending);
  const [data, setData] = useState(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const stale = getMemoryCached("home:page-data", CACHE_TTL.tmdbTrending);

    if (stale) {
      setData(stale);
      setLoading(false);
    } else {
      setLoading(true);
    }

    fetchHomePageData()
      .then((nextData) => {
        if (!isMounted) return;
        setData(nextData);
        const hasAnyResults = [
          nextData.heroMovies,
          nextData.trendingMovies,
          nextData.trendingShows,
        ].some((list) => list.length > 0);
        if (!hasAnyResults) {
          setError("No movies or shows were returned from TMDB.");
        }
      })
      .catch((err) => {
        console.error("Error fetching homepage data:", err);
        if (!isMounted) return;
        if (err.response) {
          setError(`API Error: ${err.response.data?.status_message || err.message}`);
        } else if (err.request) {
          setError("Network error. Please check your connection.");
        } else {
          setError(`Failed to load data: ${err.message}`);
        }
        if (!stale) setData(EMPTY_HOME_DATA);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    data: data ?? EMPTY_HOME_DATA,
    loading,
    error,
  };
}
