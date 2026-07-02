import { CACHE_TTL, getMemoryCached, setMemoryCached } from "./memoryCache";
import { tmdbGet } from "./tmdb";

const HOME_CACHE_KEY = "home:page-data";

function filterHeroItems(results) {
  return (results || [])
    .filter((item) => item.backdrop_path && item.overview && (item.title || item.name) && item.id)
    .slice(0, 10);
}

function filterCarouselItems(results) {
  return (results || []).filter((item) => item.poster_path).slice(0, 15);
}

export async function fetchHomePageData() {
  const cached = getMemoryCached(HOME_CACHE_KEY, CACHE_TTL.tmdbTrending);
  if (cached) return cached;

  const [
    movieDayRes,
    movieWeekRes,
    discoverMovieRes,
    tvDayRes,
    tvWeekRes,
    discoverTvRes,
  ] = await Promise.all([
    tmdbGet("trending/movie/day", { params: { language: "en-US" } }),
    tmdbGet("trending/movie/week", { params: { language: "en-US", page: 1 } }),
    tmdbGet("discover/movie", {
      params: {
        language: "en-US",
        sort_by: "vote_average.desc",
        "vote_count.gte": 1000,
        page: 1,
      },
    }),
    tmdbGet("trending/tv/day", { params: { language: "en-US" } }),
    tmdbGet("trending/tv/week", { params: { language: "en-US", page: 1 } }),
    tmdbGet("discover/tv", {
      params: {
        language: "en-US",
        sort_by: "vote_average.desc",
        "vote_count.gte": 500,
        page: 1,
      },
    }),
  ]);

  const data = {
    heroMovies: filterHeroItems(movieDayRes.data?.results),
    heroShows: filterHeroItems(tvDayRes.data?.results),
    trendingMovies: filterCarouselItems(movieWeekRes.data?.results),
    highestRatedMovies: filterCarouselItems(discoverMovieRes.data?.results),
    trendingShows: filterCarouselItems(tvWeekRes.data?.results),
    highestRatedShows: filterCarouselItems(discoverTvRes.data?.results),
  };

  setMemoryCached(HOME_CACHE_KEY, data, CACHE_TTL.tmdbTrending);
  return data;
}
