export const SITE_NAME = "Bombe";
export const DEFAULT_TITLE = "Bombe | Discover Movies & TV Shows";
export const DEFAULT_DESCRIPTION =
  "Discover trending, popular, and top-rated movies and TV shows. Stream, track your watchlist, and share recommendations with friends on Bombe.";
export const DEFAULT_KEYWORDS =
  "movies, tv shows, streaming, watch online, trending movies, popular tv shows, watchlist, film recommendations";

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://bombe.vercel.app";
}

export function truncateMeta(text, maxLength = 160) {
  if (!text) return DEFAULT_DESCRIPTION;
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1).trim()}…`;
}

export function buildCanonicalUrl(path = "") {
  const siteUrl = getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

export function buildPageTitle(title) {
  if (!title) return DEFAULT_TITLE;
  if (title.includes(SITE_NAME)) return title;
  return `${title} | ${SITE_NAME}`;
}

export function getTmdbImageUrl(path, size = "w500") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function buildMoviePath(movieId) {
  return `/movie/${movieId}`;
}

export function buildTvPath(seriesId, season = 1, episode = 1) {
  return `/watchTv/${seriesId}/${season}/${episode}`;
}

export function buildMovieJsonLd(movie, canonicalUrl) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.overview,
    url: canonicalUrl,
    image: getTmdbImageUrl(movie.poster_path),
    datePublished: movie.release_date || undefined,
    genre: movie.genres?.map((g) => g.name) || undefined,
  };

  if (movie.vote_average && movie.vote_count) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: movie.vote_average,
      bestRating: 10,
      ratingCount: movie.vote_count,
    };
  }

  return jsonLd;
}

export function buildTvEpisodeJsonLd(tvShow, season, episode, canonicalUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "TVEpisode",
    name: `${tvShow.name} - Season ${season} Episode ${episode}`,
    description: tvShow.overview,
    url: canonicalUrl,
    image: getTmdbImageUrl(tvShow.poster_path),
    partOfSeries: {
      "@type": "TVSeries",
      name: tvShow.name,
      description: tvShow.overview,
      image: getTmdbImageUrl(tvShow.poster_path),
      datePublished: tvShow.first_air_date || undefined,
    },
    episodeNumber: episode,
    partOfSeason: {
      "@type": "TVSeason",
      seasonNumber: season,
    },
  };
}

export function buildWebSiteJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
