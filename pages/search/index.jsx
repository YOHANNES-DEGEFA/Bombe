import React, { useState, useEffect } from "react";
import MovieCard from "../../components/MinimalCard";
import { useRouter } from "next/router";
import { SkeletonSearchPage, SkeletonGrid } from "../../components/skeleton";
import { SeoHead } from "../../components/SeoHead";
import { truncateMeta } from "../../lib/seo";
import { tmdbGet } from "../../lib/tmdb";
import { getCachedGenres } from "../../lib/tmdbGenres";

const SearchPage = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isMovie, setIsMovie] = useState(null);
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostSearched, setMostSearched] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  useEffect(() => {
    if (!router.isReady) return;
    const urlQuery = typeof router.query.q === "string" ? router.query.q : "";
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [router.isReady, router.query.q, query]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreList = await getCachedGenres();
        setGenres(genreList);
      } catch (error) {
        console.error("Error fetching genres:", error);
      } finally {
        setInitialLoad(false);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    if (!query && !initialLoad) {
      const fetchMostSearched = async () => {
        try {
          const response = await tmdbGet("trending/all/week");
          const filteredResults = (response.data?.results || []).filter(
            (item) => item.poster_path
          );
          setMostSearched(filteredResults.slice(0, 10));
        } catch (error) {
          console.error("Error fetching most searched shows:", error);
        }
      };

      fetchMostSearched();
    }
  }, [query, initialLoad]);

  useEffect(() => {
    if (query) {
      const fetchResults = async () => {
        setLoading(true);
        try {
          const response = await tmdbGet("search/multi", {
            params: {
              query,
              year: year ? parseInt(year, 10) : undefined,
              with_genres: genre || undefined,
            },
          });
          let filteredResults = response.data?.results || [];
          if (query) {
            filteredResults = response.data.results.filter(
              (item) =>
                item.poster_path &&
                (isMovie === null ||
                  (isMovie
                    ? item.media_type === "movie"
                    : item.media_type === "tv"))
            );
          }
          setResults(filteredResults);
        } catch (error) {
          console.error("Error fetching search results:", error);
        } finally {
          setLoading(false);
        }
      };

      const debounceTimer = setTimeout(() => {
        fetchResults();
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else {
      setResults([]);
    }
  }, [query, isMovie, year, genre]);

  if (initialLoad) {
    return <SkeletonSearchPage />;
  }

  return (
    <div className="min-h-screen bg-primary text-textprimary flex flex-col mt-20">
      <SeoHead
        title={query ? `Search: ${query}` : "Search Movies & TV Shows"}
        description={
          query
            ? truncateMeta(`Search results for "${query}" — find movies and TV shows on Bombe.`)
            : "Search thousands of movies and TV shows. Filter by genre, year, and type to find what to watch next on Bombe."
        }
        canonicalPath={query ? `/search?q=${encodeURIComponent(query)}` : "/search"}
        keywords="search movies, search tv shows, find films, what to watch"
      />
      <main className="flex-1 p-6">
        <section className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            {query ? `Results for "${query}"` : "Search Movies & TV Shows"}
          </h1>
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Search for movies or TV shows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3 bg-secondary rounded-md text-textprimary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm">Type:</label>
                <button
                  onClick={() => setIsMovie(null)}
                  className={`px-4 py-2 rounded-md ${
                    isMovie === null
                      ? "bg-accent text-on-accent"
                      : "bg-secondary text-textsecondary hover:bg-hover-surface"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setIsMovie(true)}
                  className={`px-4 py-2 rounded-md ${
                    isMovie === true
                      ? "bg-accent text-on-accent"
                      : "bg-secondary text-textsecondary hover:bg-hover-surface"
                  }`}
                >
                  Movies
                </button>
                <button
                  onClick={() => setIsMovie(false)}
                  className={`px-4 py-2 rounded-md ${
                    isMovie === false
                      ? "bg-accent text-on-accent"
                      : "bg-secondary text-textsecondary hover:bg-hover-surface"
                  }`}
                >
                  TV Shows
                </button>
              </div>

              <div className="flex items-center space-x-2 relative">
                <label htmlFor="yearInput" className="text-sm">
                  Year:
                </label>
                <input
                  type="number"
                  id="yearInput"
                  placeholder="YYYY"
                  value={year}
                  onChange={(e) => {
                    if (e.target.value.length <= 4) {
                      setYear(e.target.value);
                    }
                  }}
                  className={`px-4 py-2 bg-secondary rounded-md text-textprimary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent ${
                    year && year.length !== 4 ? "border-error" : ""
                  }`}
                  aria-label="Year filter"
                  maxLength={4}
                />
                {year && (
                  <button
                    onClick={() => setYear("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted hover:text-textsecondary"
                    aria-label="Clear year filter"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm">Genre:</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="px-4 py-2 bg-secondary rounded-md text-textprimary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">All Genres</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto mt-8">
          {loading ? (
            <SkeletonGrid count={8} seed="search-results" variant="search" />
          ) : query ? (
            results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.map((item) => (
                  <MovieCard
                    key={item.id}
                    movie={item}
                    skipDetailFetch
                    onClick={() =>
                      router.push(`/${item.media_type}/${item.id}`)
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-textsecondary">No results found.</p>
            )
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-6">Most Searched</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mostSearched.map((item) => (
                  <MovieCard
                    key={item.id}
                    movie={item}
                    skipDetailFetch
                    onClick={() =>
                      router.push(`/${item.media_type}/${item.id}`)
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SearchPage;
