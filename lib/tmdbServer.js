const TMDB_BASE = "https://api.themoviedb.org/3";

function getApiKey() {
  return process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_API_KEY;
}

export async function fetchTmdb(path, params = {}) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const normalizedPath = path.replace(/^\//, "");
  const url = new URL(`${TMDB_BASE}/${normalizedPath}`);
  url.searchParams.set("api_key", apiKey);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.success === false) return null;

    return data;
  } catch {
    return null;
  }
}
