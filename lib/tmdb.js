import axios from "axios";
import {
  CACHE_TTL,
  getMemoryCached,
  setMemoryCached,
} from "./memoryCache";

export const TMDB_IMAGE_ORIGINAL = "https://image.tmdb.org/t/p/original";
export const TMDB_IMAGE_W500 = "https://image.tmdb.org/t/p/w500";
export const TMDB_IMAGE_W185 = "https://image.tmdb.org/t/p/w185";

const tmdbClient = axios.create({
  baseURL: "/api/tmdb",
});

function normalizePath(path) {
  return path
    .replace(/^https:\/\/api\.themoviedb\.org\/3\/?/, "")
    .replace(/^\//, "");
}

function stableSerialize(value) {
  if (!value || typeof value !== "object") return String(value);
  const sorted = Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      acc[key] = value[key];
      return acc;
    }, {});
  return JSON.stringify(sorted);
}

function getTmdbTtl(path) {
  if (path.startsWith("trending/")) return CACHE_TTL.tmdbTrending;
  if (path.startsWith("discover/")) return CACHE_TTL.tmdbDiscover;
  if (/^(movie|tv)\/\d+/.test(path)) return CACHE_TTL.tmdbDetail;
  if (path.startsWith("genre/")) return CACHE_TTL.tmdbDefault;
  if (path.startsWith("search/")) return CACHE_TTL.tmdbDefault;
  return CACHE_TTL.tmdbDefault;
}

function buildCacheKey(path, params) {
  return `tmdb:${path}:${stableSerialize(params)}`;
}

export function tmdbGet(path, options = {}) {
  const { params = {}, ...rest } = options;
  const { api_key: _apiKey, ...safeParams } = params;
  const normalizedPath = normalizePath(path);
  const cacheKey = buildCacheKey(normalizedPath, safeParams);
  const ttl = getTmdbTtl(normalizedPath);

  const cached = getMemoryCached(cacheKey, ttl);
  if (cached) {
    return Promise.resolve({ data: cached, fromCache: true });
  }

  return tmdbClient
    .get(`/${normalizedPath}`, {
      params: safeParams,
      ...rest,
    })
    .then((response) => {
      setMemoryCached(cacheKey, response.data, ttl);
      return response;
    });
}

export function prefetchTmdb(paths) {
  return Promise.all(
    paths.map(({ path, params }) =>
      tmdbGet(path, { params }).catch(() => null)
    )
  );
}
