import { getSiteUrl, buildMoviePath, buildTvPath } from "../lib/seo";
import { fetchTmdb } from "../lib/tmdbServer";

function generateSiteMap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, changefreq, priority }) => `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  const siteUrl = getSiteUrl();

  const staticPages = [
    { loc: siteUrl, changefreq: "daily", priority: "1.0" },
    { loc: `${siteUrl}/home`, changefreq: "daily", priority: "0.9" },
    { loc: `${siteUrl}/search`, changefreq: "weekly", priority: "0.8" },
  ];

  const [trendingMovies, trendingTv, popularMovies, popularTv] = await Promise.all([
    fetchTmdb("trending/movie/week", { language: "en-US" }),
    fetchTmdb("trending/tv/week", { language: "en-US" }),
    fetchTmdb("movie/popular", { language: "en-US", page: 1 }),
    fetchTmdb("tv/popular", { language: "en-US", page: 1 }),
  ]);

  const movieIds = new Set();
  const tvIds = new Set();

  [...(trendingMovies?.results || []), ...(popularMovies?.results || [])].forEach((movie) => {
    if (movie?.id) movieIds.add(movie.id);
  });

  [...(trendingTv?.results || []), ...(popularTv?.results || [])].forEach((show) => {
    if (show?.id) tvIds.add(show.id);
  });

  const movieUrls = Array.from(movieIds).map((id) => ({
    loc: `${siteUrl}${buildMoviePath(id)}`,
    changefreq: "weekly",
    priority: "0.7",
  }));

  const tvUrls = Array.from(tvIds).map((id) => ({
    loc: `${siteUrl}${buildTvPath(id)}`,
    changefreq: "weekly",
    priority: "0.7",
  }));

  const sitemap = generateSiteMap([...staticPages, ...movieUrls, ...tvUrls]);

  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function SiteMap() {
  return null;
}
