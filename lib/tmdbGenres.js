import { CACHE_TTL, getMemoryCached, setMemoryCached } from "./memoryCache";
import { tmdbGet } from "./tmdb";

const GENRES_CACHE_KEY = "tmdb:genres:combined";

export async function getCachedGenres() {
  const cached = getMemoryCached(GENRES_CACHE_KEY, CACHE_TTL.tmdbDefault);
  if (cached) return cached;

  const [movieGenresRes, tvGenresRes] = await Promise.all([
    tmdbGet("genre/movie/list", { params: { language: "en-US" } }),
    tmdbGet("genre/tv/list", { params: { language: "en-US" } }),
  ]);

  const combinedGenres = [
    ...(movieGenresRes.data?.genres || []),
    ...(tvGenresRes.data?.genres || []),
  ];
  const uniqueGenres = Array.from(
    new Map(combinedGenres.map((item) => [item.id, item])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  setMemoryCached(GENRES_CACHE_KEY, uniqueGenres, CACHE_TTL.tmdbDefault);
  return uniqueGenres;
}

export async function getCachedMovieGenres() {
  const all = await getCachedGenres();
  return all;
}
