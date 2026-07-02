import dynamic from "next/dynamic";
import { FaFire, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import MovieCard from "../../components/MinimalCard";
import { SkeletonHero, SkeletonHomePage } from "../../components/skeleton";
import { SeoHead } from "../../components/SeoHead";
import { buildBrandJsonLd } from "../../lib/seo";
import { useHomeData } from "../../hooks/useHomeData";

const TrendingMovies = dynamic(() => import("../../components/TrendingMovies"), {
  ssr: false,
  loading: () => <SkeletonHero seed="trending-movies-hero" withMarginTop={false} className="-mt-16" />,
});

const TrendingShows = dynamic(() => import("../../components/TrendingShows"), {
  ssr: false,
  loading: () => null,
});

const cardHoverVariants = {
  rest: { scale: 1, transition: { duration: 0.2 } },
  hover: { scale: 1.05, y: -5, transition: { duration: 0.2 } },
};

function CarouselSection({ title, icon: Icon, data, mediaType }) {
  if (!data || data.length === 0) return null;

  return (
    <section className="mb-10 md:mb-12 px-4 md:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-4 px-4 md:px-0">
        <Icon className="text-accent text-xl md:text-2xl" />
        <h2 className="text-xl md:text-2xl font-semibold text-textprimary">{title}</h2>
      </div>

      <div className="flex overflow-x-auto space-x-4 md:space-x-6 pb-4 pt-5 scrollbar-hide pl-4 md:pl-0 hide-scrollbar">
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
        <div className="flex-shrink-0 w-1" />
      </div>
    </section>
  );
}

const MovieList = () => {
  const { data, loading, error } = useHomeData();

  if (loading) {
    return <SkeletonHomePage />;
  }

  return (
    <>
      <SeoHead
        title="Bombe — Discover Trending Movies & TV Shows"
        description="Bombe — browse trending movies and TV shows, top-rated picks, and personalized recommendations. Your home for streaming discovery."
        canonicalPath="/home"
        keywords="Bombe, Bombe movies, Bombe TV, trending movies, popular tv shows, streaming"
        jsonLd={buildBrandJsonLd()}
      />
      <h1 className="sr-only">Bombe — Discover Trending Movies and TV Shows</h1>
      <TrendingMovies items={data.heroMovies} />

      <main className="md:py-10 max-w-full mx-auto">
        {error && (
          <div className="mb-8 p-4 bg-red-900/30 border border-red-700/50 text-red-300 rounded-md text-center">
            Error loading some sections: {error}
          </div>
        )}

        <CarouselSection title="Trending Movies" icon={FaFire} data={data.trendingMovies} mediaType="movie" />
        <CarouselSection title="Highest Rated Movies" icon={FaStar} data={data.highestRatedMovies} mediaType="movie" />
        <TrendingShows items={data.heroShows} />
        <CarouselSection title="Trending Shows" icon={FaFire} data={data.trendingShows} mediaType="tv" />
        <CarouselSection title="Highest Rated Shows" icon={FaStar} data={data.highestRatedShows} mediaType="tv" />
      </main>
    </>
  );
};

export default MovieList;
