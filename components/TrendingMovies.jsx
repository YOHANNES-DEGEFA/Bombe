// components/TrendingMovies.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { FaStar } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { TMDB_IMAGE_ORIGINAL, tmdbGet } from "../lib/tmdb";
import { SkeletonHero } from "./skeleton";

const IMAGE_BASE_URL = TMDB_IMAGE_ORIGINAL;

const TrendingMovies = ({ items: itemsProp }) => {
  const [trendingMovies, setTrendingMovies] = useState(itemsProp || []);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const router = useRouter();
  const [loadingList, setLoadingList] = useState(!itemsProp?.length);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [movieDetails, setMovieDetails] = useState(null);
  const intervalRef = useRef(null);

  // Fetch trending movies list (keep as is)
  useEffect(() => {
    if (itemsProp?.length) {
      setTrendingMovies(itemsProp);
      setCurrentMovieIndex(0);
      setLoadingList(false);
      return;
    }

    setLoadingList(true);
    const fetchTrending = async () => {
      try {
        const response = await tmdbGet("trending/movie/day", {
          params: { language: "en-US" },
        });
        const validMovies = (response.data?.results || [])
          .filter((m) => m.backdrop_path && m.overview && m.title && m.id)
          .slice(0, 10);
        setTrendingMovies(validMovies);
        if (validMovies.length > 0) setCurrentMovieIndex(0);
      } catch (error) {
        console.error("Error fetching trending movies:", error);
        setTrendingMovies([]);
      } finally {
        setLoadingList(false);
      }
    };
    fetchTrending();
  }, [itemsProp]);

   // Fetch details for the current movie (keep as is)
   useEffect(() => {
    let isMounted = true;
    if (trendingMovies.length > 0) {
      const currentMovie = trendingMovies[currentMovieIndex];
      if (!currentMovie) return;

      setLoadingDetails(true);
      setMovieDetails((prevDetails) =>
        prevDetails?.id === currentMovie.id ? prevDetails : null
      );

      const fetchMovieDetails = async () => {
        try {
          const response = await tmdbGet(`movie/${currentMovie.id}`, {
            params: {
              append_to_response: "credits,genres",
              language: "en-US",
            },
          });
          if (isMounted && response.data.id === trendingMovies[currentMovieIndex]?.id) {
            setMovieDetails(response.data);
          }
        } catch (error) {
          console.error(`Error fetching movie details for ID ${currentMovie.id}:`, error);
          if (isMounted && trendingMovies[currentMovieIndex]?.id === currentMovie.id) {
            setMovieDetails(null);
          }
        } finally {
          if (isMounted && trendingMovies[currentMovieIndex]?.id === currentMovie.id) {
            setLoadingDetails(false);
          }
        }
      };

      const detailFetchTimeout = setTimeout(fetchMovieDetails, 150);
      return () => {
        isMounted = false;
        clearTimeout(detailFetchTimeout);
      };
    }
    setMovieDetails(null);
    setLoadingDetails(false);
   }, [trendingMovies, currentMovieIndex]);

  // Auto-rotation (keep as is)
  const startAutoRotate = useCallback(() => { if (intervalRef.current) clearInterval(intervalRef.current); intervalRef.current = setInterval(() => { paginate(1); }, 7000); }, [trendingMovies.length]); // Dependency based on length
  useEffect(() => { if (trendingMovies.length > 1) startAutoRotate(); return () => { if (intervalRef.current) clearInterval(intervalRef.current); }; }, [trendingMovies.length, startAutoRotate]);

  // Navigation Logic (keep as is)
  const paginate = (newDirection) => { if (trendingMovies.length <= 1) return; let newIndex = currentMovieIndex + newDirection; if (newIndex < 0) newIndex = trendingMovies.length - 1; else if (newIndex >= trendingMovies.length) newIndex = 0; setDirection(newDirection); setCurrentMovieIndex(newIndex); startAutoRotate(); };
   const goToIndex = (index) => { if (index === currentMovieIndex || trendingMovies.length <= 1) return; setDirection(index > currentMovieIndex ? 1 : -1); setCurrentMovieIndex(index); startAutoRotate(); }

  // Swipe handlers (keep as is)
  const handlers = useSwipeable({ onSwipedLeft: () => paginate(1), onSwipedRight: () => paginate(-1), preventDefaultTouchmoveEvent: true, trackMouse: true, });

  // Routing (keep as is)
  const handleWatch = (movieId) => { router.push(`/movie/${movieId}`); };

  // Framer Motion Variants (keep as is)
  const variants = { enter: (direction) => ({ x: direction > 0 ? "100%" : "-100%", opacity: 0 }), center: { zIndex: 1, x: 0, opacity: 1 }, exit: (direction) => ({ zIndex: 0, x: direction < 0 ? "100%" : "-100%", opacity: 0 }), };
   const textVariants = { hidden: { opacity: 0, y: 25 }, visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut", delay } }), exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: "easeIn" } } };

  // --- Render ---
  if (loadingList) {
    return <SkeletonHero seed="trending-movies-hero" withMarginTop={false} className="-mt-16" />;
  }

  if (trendingMovies.length === 0) {
    return (
      <div className="h-[60vh] -mt-16 flex items-center justify-center bg-primary text-textsecondary">
        <p>No trending movies found.</p>
      </div>
    );
  }

  const currentMovie = trendingMovies[currentMovieIndex];
  if (!currentMovie) return null;
  const showDetails = !loadingDetails && movieDetails && movieDetails.id === currentMovie.id;

  return (
    <div className="relative w-full h-[75vh] overflow-hidden font-poppins bg-primary -mt-16" {...handlers}>

      {/* Background Image Slider */}
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={currentMovieIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: "spring", stiffness: 250, damping: 30 }, opacity: { duration: 0.3 } }}
          className="absolute inset-0"
        >
           <div className="absolute inset-0 z-0">
             <img
                src={`${IMAGE_BASE_URL}${currentMovie.backdrop_path}`}
                alt={`${currentMovie.title} backdrop`}
                className="w-full h-full object-cover"
             />
             {/* Themed Gradients */}
             <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-transparent"></div> {/* Use primary */}
             <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-transparent to-transparent opacity-80"></div> {/* Use primary */}
           </div>
        </motion.div>
      </AnimatePresence>


      {/* Content Overlay - ADJUSTED PADDING */}
      <div className="relative z-10 h-full flex flex-col justify-end items-start text-textprimary px-6 pt-6 pb-20 md:px-10 md:pt-10 md:pb-24 lg:px-20 lg:pt-12 lg:pb-28">
         <AnimatePresence mode="wait">
            {showDetails ? (
              <motion.div
                key={movieDetails.id}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                className="max-w-lg md:max-w-xl"
               >
                <motion.h2 variants={textVariants} custom={0} className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 drop-shadow-lg leading-tight text-textprimary">
                  {movieDetails.title}
                </motion.h2>

                 <motion.div variants={textVariants} custom={0.1} className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
                  {movieDetails.genres.slice(0, 3).map((genre) => (
                    // Themed genre tags
                    <span key={genre.id} className="bg-secondary/70 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs md:text-sm font-medium text-textsecondary border border-secondary-light">
                      {genre.name}
                    </span>
                  ))}
                  {movieDetails.vote_average > 0 && (
                    <span className="bg-secondary/70 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs md:text-sm font-medium flex items-center gap-1 text-textprimary"> {/* Themed rating tag */}
                       <FaStar className="text-accent" /> {/* Accent Star */}
                       {movieDetails.vote_average.toFixed(1)}
                    </span>
                  )}
                 </motion.div>

                <motion.p variants={textVariants} custom={0.2} className="text-sm md:text-base text-textsecondary mb-5 md:mb-6 line-clamp-2 md:line-clamp-3 leading-relaxed"> {/* Themed overview text */}
                  {movieDetails.overview}
                </motion.p>

                 <motion.button
                    variants={textVariants}
                    custom={0.3}
                    onClick={() => handleWatch(currentMovie.id)}
                    // Themed button
                    className="bg-accent hover:bg-accent-hover text-on-accent font-semibold py-2 px-5 md:py-2.5 md:px-7 rounded-full text-sm md:text-base shadow-lg transition-all duration-300 transform hover:scale-105"
                    whileTap={{ scale: 0.95 }}
                 >
                   Watch Now <span className="ml-1" aria-hidden="true">&rarr;</span>
                 </motion.button>

              </motion.div>
            ) : (
                 <motion.div key={currentMovie.id + "-loading"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <SkeletonHero variant="content" seed={`movie-${currentMovie.id}`} />
                 </motion.div>
             )}
         </AnimatePresence>
      </div>

      {/* Navigation Arrows - Themed background */}
      <button onClick={() => paginate(-1)} className="absolute left-2 md:left-4 top-1/2 z-20 transform -translate-y-1/2 p-2 bg-black/50 rounded-full text-textprimary hover:bg-black/70 transition-all duration-200 hidden md:block opacity-70 hover:opacity-100" aria-label="Previous Movie">
        <FiChevronLeft size={24} />
      </button>
      <button onClick={() => paginate(1)} className="absolute right-2 md:right-4 top-1/2 z-20 transform -translate-y-1/2 p-2 bg-black/50 rounded-full text-textprimary hover:bg-black/70 transition-all duration-200 hidden md:block opacity-70 hover:opacity-100" aria-label="Next Movie">
        <FiChevronRight size={24} />
      </button>

      {/* Navigation Dots - Themed colors */}
      {/* Adjusted bottom position slightly */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2.5">
        {trendingMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
            className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ease-in-out cursor-pointer
                        ${currentMovieIndex === index ? 'bg-accent scale-125 ring-2 ring-accent/50 ring-offset-2 ring-offset-primary/50' : 'bg-textsecondary/40 hover:bg-textsecondary/70'}`} // Themed dots
            aria-label={`Go to slide ${index + 1}`}
            aria-current={currentMovieIndex === index ? 'step' : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default TrendingMovies;