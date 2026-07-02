import { tmdbGet } from "./tmdb";

export async function fetchTmdbEndpoint(endpoint) {
  const [path, queryString] = endpoint.split("?");
  const params = Object.fromEntries(new URLSearchParams(queryString || ""));
  const { data } = await tmdbGet(path, {
    params: { language: "en-US", ...params },
  });
  return data;
}
