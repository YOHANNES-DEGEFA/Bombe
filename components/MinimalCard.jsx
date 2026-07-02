import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { FaPlus, FaCheck, FaStar, FaFilm } from "react-icons/fa";
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { TMDB_IMAGE_W500, tmdbGet } from "../lib/tmdb";
import { useWatchlistContext } from "../context/WatchlistContext";
import { useAuth } from "../hooks/useAuth";

const IMAGE_BASE_URL_W500 = TMDB_IMAGE_W500;

const genreMap = { 28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western", 10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics" };

function resolveGenres(movie) {
  if (movie?.genres?.length) {
    return movie.genres.map((genre) => genre.name || genre).slice(0, 2).join(", ");
  }
  if (movie?.genre_ids?.length) {
    return movie.genre_ids.map((id) => genreMap[id] || "").filter(Boolean).slice(0, 2).join(", ");
  }
  return "N/A";
}

function hasGenreData(movie) {
  return Boolean(movie?.genres?.length || movie?.genre_ids?.length);
}

const MovieCard = ({ movie: initialMovie, media_type: mediaTypeProp, onClick, skipDetailFetch = false }) => {
  const router = useRouter();
  const { userId } = useAuth();
  const watchlist = useWatchlistContext();
  const resolvedMediaType =
    mediaTypeProp ||
    initialMovie?.media_type ||
    (initialMovie?.first_air_date ? "tv" : "movie");

  const initialGenres = useMemo(() => resolveGenres(initialMovie), [initialMovie]);
  const shouldSkipDetailFetch = skipDetailFetch || hasGenreData(initialMovie);

  const [displayData, setDisplayData] = useState({
      id: initialMovie.id,
      title: initialMovie.title || initialMovie.name || "Loading...",
      poster_path: initialMovie.poster_path,
      vote_average: initialMovie.vote_average,
      genres: initialGenres,
      media_type: resolvedMediaType,
  });

  const isAdded = watchlist?.isInWatchlist(initialMovie?.id, resolvedMediaType) ?? false;

  useEffect(() => {
      if (!initialMovie?.id) return;
      if (shouldSkipDetailFetch) {
        setDisplayData({
          id: initialMovie.id,
          title: initialMovie.title || initialMovie.name || "Unknown",
          poster_path: initialMovie.poster_path,
          vote_average: initialMovie.vote_average,
          genres: initialGenres,
          media_type: resolvedMediaType,
        });
        return;
      }

      const mediaType = resolvedMediaType;
      let isMounted = true;

      const fetchDetails = async () => {
          try {
              const { data } = await tmdbGet(`${mediaType}/${initialMovie.id}`, {
                      params: { language: "en-US" },
                  }
              );
              if (isMounted && data) {
                   const fetchedGenres = data.genres?.map(g => g.name).slice(0, 2).join(', ') ||
                                        initialGenres ||
                                        "N/A";
                   setDisplayData({
                        id: initialMovie.id,
                        title: data.title || data.name || initialMovie.title || initialMovie.name || "Unknown",
                        poster_path: data.poster_path ?? initialMovie.poster_path,
                        vote_average: data.vote_average ?? initialMovie.vote_average,
                        genres: fetchedGenres,
                        media_type: mediaType,
                    });
              }
          } catch (error) {
              console.error("Error fetching details in card:", error);
               if (isMounted) {
                    setDisplayData({
                      id: initialMovie.id,
                      title: initialMovie.title || initialMovie.name || "Unknown",
                      poster_path: initialMovie.poster_path,
                      vote_average: initialMovie.vote_average,
                      genres: initialGenres,
                      media_type: mediaType,
                    });
               }
          }
      };

      fetchDetails();
      return () => { isMounted = false; };

  }, [initialMovie, resolvedMediaType, shouldSkipDetailFetch, initialGenres]);

  const toggleWatchlist = async (e) => {
    e.stopPropagation();
    if (!userId) {
      toast.error("Please log in to manage watchlist.");
      router.push("/");
      return;
    }
    if (!initialMovie?.id) {
        toast.error("Cannot add item: Critical data missing.");
        return;
    }

    const itemDataMinimal = {
      id: initialMovie.id,
      media_type: resolvedMediaType,
      title: initialMovie.title || null,
      name: initialMovie.name || null,
      poster_path: initialMovie.poster_path || null,
    };

    Object.keys(itemDataMinimal).forEach(key => {
        if (itemDataMinimal[key] === null || itemDataMinimal[key] === undefined) {
             delete itemDataMinimal[key];
        }
    });

     if (!itemDataMinimal.id || !itemDataMinimal.media_type) {
         toast.error("Cannot add item: ID or Type missing.");
         return;
     }

    const wasAdded = isAdded;

    try {
      if (wasAdded) {
        await watchlist?.removeFromWatchlist(itemDataMinimal.id, itemDataMinimal.media_type);
        toast.success("Removed from Watchlist");
      } else {
        await watchlist?.addToWatchlist(itemDataMinimal);
        toast.success("Added to Watchlist");
      }
    } catch (err) {
      console.error("Error updating watchlist:", err);
      toast.error("Failed to update watchlist.");
    }
  };

  const handleClick = onClick ? (e) => {
      e.stopPropagation();
      onClick(displayData);
   } : (e) => {
       e.stopPropagation();
       handleWatch();
   };

  const handleCardKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e);
      }
  };

   const handleWatch = () => {
       if (!displayData.id) return;
       const url = displayData.media_type === "tv"
         ? `/watchTv/${displayData.id}/1/1`
         : `/movie/${displayData.id}`;
       router.push(url);
   };


  return (
    <motion.div
      className="tv-focusable relative w-full rounded-lg overflow-hidden group transition-transform duration-300 ease-in-out border border-secondary/50 hover:border-accent/50 focus:border-accent shadow-md hover:shadow-accent/10 focus:shadow-accent/20 cursor-pointer"
      onClick={handleClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      whileHover={{ y: -5 }}
      title={`${displayData.title} (${displayData.media_type === 'tv' ? 'TV' : 'Movie'})`}
      aria-label={`Open ${displayData.title} ${displayData.media_type === 'tv' ? 'TV show' : 'movie'}`}
    >
      <div className="aspect-[2/3] bg-secondary">
        {displayData.poster_path ? (
            <img
                src={`${IMAGE_BASE_URL_W500}${displayData.poster_path}`}
                alt={`${displayData.title} Poster`}
                className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                loading="lazy"
            />
         ) : (
             <div className="w-full h-full flex items-center justify-center text-textsecondary/50">
                 <FaFilm />
             </div>
         )}
      </div>

      <button
        className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all duration-200 backdrop-blur-sm ${
          isAdded
            ? "bg-accent/80 text-on-accent hover:bg-accent"
            : "bg-black/50 text-textprimary hover:bg-accent focus:bg-accent hover:text-on-accent focus:text-on-accent opacity-0 group-hover:opacity-100 group-focus:opacity-100 focus:opacity-100"
        }`}
        onClick={toggleWatchlist}
        title={isAdded ? "Remove from Watchlist" : "Add to Watchlist"}
      >
        {isAdded ? <FaCheck size={12} /> : <FaPlus size={12} />}
      </button>

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-secondary via-secondary/80 to-transparent p-3 pt-6">
        <div className="flex items-end gap-2">
             <div className="flex-1 overflow-hidden">
                 <h3 className="text-sm md:text-base font-semibold text-textprimary truncate">
                    {displayData.title}
                 </h3>
                 <p className="text-xs text-textsecondary truncate">
                    {displayData.vote_average > 0 && (
                         <span className="inline-flex items-center mr-2">
                            <FaStar className="text-accent mr-0.5" size={10}/> {displayData.vote_average?.toFixed(1)}
                         </span>
                    )}
                    {displayData.genres}
                 </p>
             </div>
         </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
