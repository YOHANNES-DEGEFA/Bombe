// pages/index.js or pages/home.js (or wherever MovieList is)
import { useEffect, useState } from "react";
import MovieCard from "../../components/MinimalCard";
import TrendingMovies from "../../components/TrendingMovies";
import TrendingShows from "../../components/TrendingShows";
import { FaFire, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { tmdbGet } from "../../lib/tmdb";
import { SkeletonHomePage } from "../../components/skeleton";
import { SeoHead } from "../../components/SeoHead";
import { buildWebSiteJsonLd } from "../../lib/seo";

const MovieList = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  // const [mostWatchedMovies, setMostWatchedMovies] = useState([]); // Optional
  const [highestRatedMovies, setHighestRatedMovies] = useState([]);
  const [trendingShows, setTrendingShows] = useState([]);
  const [highestRatedShows, setHighestRatedShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchAllData = async () => {
      try {
        const responses = await Promise.all([
          tmdbGet("trending/movie/week", { params: { language: "en-US", page: 1 } }),
          tmdbGet("discover/movie", {
            params: {
              language: "en-US",
              sort_by: "vote_average.desc",
              "vote_count.gte": 1000,
              page: 1,
            },
          }),
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

        const filterAndSlice = (results) =>
          (results || []).filter((item) => item.poster_path).slice(0, 15);

        setTrendingMovies(filterAndSlice(responses[0]?.data?.results));
        setHighestRatedMovies(filterAndSlice(responses[1]?.data?.results));
        setTrendingShows(filterAndSlice(responses[2]?.data?.results));
        setHighestRatedShows(filterAndSlice(responses[3]?.data?.results));

        const hasAnyResults =
          responses.some((response) => (response?.data?.results || []).length > 0);

        if (!hasAnyResults) {
          setError("No movies or shows were returned from TMDB.");
        }

      } catch (err) {
        console.error("Error fetching homepage data:", err);
        if (err.response) { setError(`API Error: ${err.response.data?.status_message || err.message}`); }
        else if (err.request) { setError("Network error. Please check your connection."); }
        else { setError(`Failed to load data: ${err.message}`); }
        setTrendingMovies([]); setHighestRatedMovies([]); setTrendingShows([]); setHighestRatedShows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Card hover variants
  const cardHoverVariants = {
     rest: { scale: 1, transition: { duration: 0.2 } },
     hover: { scale: 1.05, y: -5, transition: { duration: 0.2 } }
  }

  // Helper component for Carousel Section
  const CarouselSection = ({ title, icon: Icon, data, mediaType }) => {
    const router = useRouter();
    if (!data || data.length === 0) return null;
    
    
  
    return (
      <section className="mb-10 md:mb-12 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4 px-4 md:px-0">
          <Icon className="text-accent text-xl md:text-2xl" />
          <h2 className="text-xl md:text-2xl font-semibold text-textprimary">{title}</h2>
        </div>
        
        <div className="flex overflow-x-auto space-x-4 md:space-x-6 pb-4 pt-5 scrollbar-hide pl-4 md:pl-0 hide-scrollbar" >
          {data.map((item) => (
            <motion.div
              key={`${mediaType}-${item.id}`}
              className="flex-shrink-0 w-36 md:w-44 lg:w-48 cursor-pointer"
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
              
            >
              <MovieCard
                movie={{ ...item, media_type: mediaType }}
                media_type={mediaType}
                skipDetailFetch
              />
            </motion.div>
          ))}
          <div className="flex-shrink-0 w-1"></div>
        </div>
      </section>
    );
  };

  // --- Render ---

  if (loading) {
    return <SkeletonHomePage />;
  }

  return (
    <>
      <SeoHead
        title="Discover Trending Movies & TV Shows"
        description="Browse trending movies and TV shows, top-rated picks, and personalized recommendations. Your home for streaming discovery on Bombe."
        canonicalPath="/home"
        keywords="trending movies, popular tv shows, top rated films, streaming, watch online"
        jsonLd={buildWebSiteJsonLd()}
      />
      <h1 className="sr-only">Discover Trending Movies and TV Shows on Bombe</h1>
      <TrendingMovies />

      <main className="md:py-10 max-w-full mx-auto">
         {error && (
           <div className="mb-8 p-4 bg-red-900/30 border border-red-700/50 text-red-300 rounded-md text-center">
             Error loading some sections: {error}
           </div>
         )}

          <CarouselSection title="Trending Movies" icon={FaFire} data={trendingMovies} mediaType="movie" />
          <CarouselSection title="Highest Rated Movies" icon={FaStar} data={highestRatedMovies} mediaType="movie" />
          <TrendingShows />
          <CarouselSection title="Trending Shows" icon={FaFire} data={trendingShows} mediaType="tv" />
          <CarouselSection title="Highest Rated Shows" icon={FaStar} data={highestRatedShows} mediaType="tv" />
      </main>
    </>
  );
};

export default MovieList;