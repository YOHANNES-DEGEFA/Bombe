export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      status_code: 7,
      status_message:
        "TMDB API key is not configured. Add TMDB_API_KEY to .env.local and restart the dev server.",
    });
    return;
  }

  const pathSegments = req.query.path;
  const tmdbPath = Array.isArray(pathSegments)
    ? pathSegments.join("/")
    : pathSegments || "";

  const params = new URLSearchParams();
  Object.entries(req.query).forEach(([key, value]) => {
    if (key === "path" || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
      return;
    }
    params.set(key, value);
  });
  params.set("api_key", apiKey);

  const url = `https://api.themoviedb.org/3/${tmdbPath}?${params.toString()}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json(data);
      return;
    }

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.status(200).json(data);
  } catch {
    res.status(502).json({
      status_code: 0,
      status_message: "Failed to reach TMDB.",
    });
  }
}
