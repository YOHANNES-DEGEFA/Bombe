import axios from "axios";

export const TMDB_IMAGE_ORIGINAL = "https://image.tmdb.org/t/p/original";
export const TMDB_IMAGE_W500 = "https://image.tmdb.org/t/p/w500";
export const TMDB_IMAGE_W185 = "https://image.tmdb.org/t/p/w185";

const tmdbClient = axios.create({
  baseURL: "/api/tmdb",
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

function normalizePath(path) {
  return path
    .replace(/^https:\/\/api\.themoviedb\.org\/3\/?/, "")
    .replace(/^\//, "");
}

export function tmdbGet(path, options = {}) {
  const { params = {}, ...rest } = options;
  const { api_key: _apiKey, ...safeParams } = params;

  return tmdbClient.get(`/${normalizePath(path)}`, {
    params: safeParams,
    ...rest,
  });
}
