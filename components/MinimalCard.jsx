// components/MinimalCard.js (or MovieCard.js)
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaPlus, FaCheck, FaStar, FaFilm } from "react-icons/fa"; // Using react-icons
import { auth, db } from "../firebase";
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { safeGetDoc } from "../lib/firestore";
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { TMDB_IMAGE_W500, tmdbGet } from "../lib/tmdb";

const IMAGE_BASE_URL_W500 = TMDB_IMAGE_W500;

// Genre map (keep as is)
const genreMap = { 28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western", 10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics" };

const MovieCard = ({ movie: initialMovie, media_type: mediaTypeProp, onClick }) => {
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(false);
  const userId = auth.currentUser?.uid;
  const resolvedMediaType =
    mediaTypeProp ||
    initialMovie?.media_type ||
    (initialMovie?.first_air_date ? "tv" : "movie");

  const [displayData, setDisplayData] = useState({
      id: initialMovie.id,
      title: initialMovie.title || initialMovie.name || "Loading...",
      poster_path: initialMovie.poster_path,
      vote_average: initialMovie.vote_average,
      genres: "Loading Genre...",
      media_type: resolvedMediaType,
  });

  // Fetch full details and check watchlist status
  useEffect(() => {
      if (!initialMovie?.id) return;

      const mediaType = resolvedMediaType;
      setDisplayData(prev => ({ ...prev, media_type: mediaType }));

      let isMounted = true;

      const fetchDetails = async () => {
          try {
              const { data } = await tmdbGet(`${mediaType}/${initialMovie.id}`, {
                      params: { language: "en-US" },
                  }
              );
              if (isMounted && data) {
                   const fetchedGenres = data.genres?.map(g => g.name).slice(0, 2).join(', ') || // Get first 2 genres
                                        (initialMovie.genre_ids?.map(id => genreMap[id] || '').filter(Boolean).slice(0,2).join(', ')) || // Fallback to IDs from initial data
                                        "N/A";
                   setDisplayData(prev => ({
                        ...prev,
                        // Use fetched data if available, otherwise keep initial
                        title: data.title || data.name || prev.title,
                        vote_average: data.vote_average ?? prev.vote_average,
                        genres: fetchedGenres
                    }));
              }
          } catch (error) {
              console.error("Error fetching details in card:", error);
              // Fallback using initial data if fetch fails
               if (isMounted) {
                    const initialGenres = initialMovie.genre_ids?.map(id => genreMap[id] || '').filter(Boolean).slice(0,2).join(', ') || "N/A";
                    setDisplayData(prev => ({...prev, genres: initialGenres }));
               }
          }
      };

      // Check watchlist status
      const checkWatchlist = async () => {
            if (userId) {
                try {
                    const watchlistRef = doc(db, "watchlists", userId);
                    const watchlistDoc = await safeGetDoc(watchlistRef);
                    if (!isMounted) return;
                    if (watchlistDoc?.exists()) {
                        const items = watchlistDoc.data()?.items || [];
                        setIsAdded(items.some(item => item.id === initialMovie.id && item.media_type === mediaType));
                    } else {
                        setIsAdded(false);
                    }
                } catch (error) {
                     console.error("Error checking watchlist:", error);
                     if (isMounted) setIsAdded(false);
                }
            } else {
                 if (isMounted) setIsAdded(false);
            }
      };

      fetchDetails();
      checkWatchlist();

      return () => { isMounted = false; }; // Cleanup

  }, [initialMovie, userId, mediaTypeProp, resolvedMediaType]);

  // --- WATCHLIST TOGGLE FIX ---
  // --- WATCHLIST TOGGLE FIX ---
  const toggleWatchlist = async (e) => {
    e.stopPropagation(); // Prevent card click navigation
    if (!userId) {
      toast.error("Please log in to manage watchlist.");
      router.push("/login"); // Redirect to login
      return;
    }
    // Use initialMovie data for consistency as it's less likely to change than fetched displayData
    if (!initialMovie?.id || !initialMovie.media_type) {
        const type = initialMovie?.first_air_date ? 'tv' : 'movie'; // Try to infer type
        if(!initialMovie?.id || !type) {
            toast.error("Cannot add item: Critical data missing.");
            console.error("Watchlist Error: Missing ID or media_type", initialMovie);
            return;
        }
         // If type was inferred, use it
         initialMovie.media_type = type;
    }


    const watchlistRef = doc(db, "watchlists", userId);

    // **Define the object structure CONSISTENTLY based on ESSENTIAL data**
    // Use data directly from initialMovie prop where possible, as displayData might change
    const itemDataMinimal = {
      id: initialMovie.id,
      media_type: resolvedMediaType,
      // Use original title/name and poster from the list item prop
      title: initialMovie.title || null, // Store title if available
      name: initialMovie.name || null,   // Store name if available
      poster_path: initialMovie.poster_path || null, // Store poster if available
      // Add any other essential fields you need on the watchlist page itself
    };

    // Remove null fields to keep Firestore object clean
    Object.keys(itemDataMinimal).forEach(key => {
        if (itemDataMinimal[key] === null || itemDataMinimal[key] === undefined) {
             delete itemDataMinimal[key];
        }
    });

    // Ensure basic ID and type are present
     if (!itemDataMinimal.id || !itemDataMinimal.media_type) {
         toast.error("Cannot add item: ID or Type missing.");
         console.error("Watchlist Error: Minimal data invalid", itemDataMinimal);
         return;
     }


    const wasAdded = isAdded; // Store current state before async operation
    setIsAdded(!wasAdded); // Optimistic UI update

    try {
      const watchlistDoc = await safeGetDoc(watchlistRef);

      if (wasAdded) {
        if (watchlistDoc?.exists()) {
          const currentItems = watchlistDoc.data()?.items || [];
          // Filter OUT the item matching ID and media_type
          const updatedItems = currentItems.filter(item =>
              !(item.id === itemDataMinimal.id && item.media_type === itemDataMinimal.media_type)
          );
          // Update Firestore with the NEW filtered array
          await updateDoc(watchlistRef, { items: updatedItems });
          toast.success("Removed from Watchlist");
        } else {
            // Document didn't exist, so item couldn't have been there. Revert UI.
             console.warn("Watchlist document missing during remove attempt.");
             setIsAdded(false); // Revert optimistic update
         }
        // --- END REMOVE LOGIC ---
      } else {
        // --- ADD LOGIC ---
        // Add the MINIMAL item data using arrayUnion
        if (watchlistDoc?.exists()) {
          await updateDoc(watchlistRef, { items: arrayUnion(itemDataMinimal) });
        } else {
          // Create watchlist document if it doesn't exist
          await setDoc(watchlistRef, { items: [itemDataMinimal] });
        }
        toast.success("Added to Watchlist");
        // --- END ADD LOGIC ---
      }
    } catch (err) {
      console.error("Error updating watchlist:", err);
      toast.error("Failed to update watchlist.");
      setIsAdded(wasAdded); // Revert UI on error
    }
  };
  // --- END WATCHLIST TOGGLE FIX ---
  // --- END WATCHLIST TOGGLE FIX ---

  // Use onClick from props if provided, otherwise use default handleWatch
  const handleClick = onClick ? (e) => {
      e.stopPropagation(); // Prevent nested clicks if necessary
      onClick(displayData); // Pass potentially updated displayData
   } : (e) => {
       e.stopPropagation();
       handleWatch(); // Fallback to default navigation
   };

  const handleCardKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e);
      }
  };

    // Default navigation if no onClick prop
   const handleWatch = () => {
       if (!displayData.id) return;
       const url = displayData.media_type === "tv"
         ? `/watchTv?tv_id=${displayData.id}` // Link to detail page
         : `/watch?movie_id=${displayData.id}`; // Link to detail page
       router.push(url);
   };


  return (
    <motion.div
      className="tv-focusable relative w-full rounded-lg overflow-hidden group transition-transform duration-300 ease-in-out border border-secondary/50 hover:border-accent/50 focus:border-accent shadow-md hover:shadow-accent/10 focus:shadow-accent/20 cursor-pointer" // Themed border/shadow
      onClick={handleClick} // Use determined click handler
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      whileHover={{ y: -5 }} // Subtle lift on hover
      title={`${displayData.title} (${displayData.media_type === 'tv' ? 'TV' : 'Movie'})`} // Tooltip
      aria-label={`Open ${displayData.title} ${displayData.media_type === 'tv' ? 'TV show' : 'movie'}`}
    >
      {/* Image with Aspect Ratio */}
      <div className="aspect-[2/3] bg-secondary"> {/* Background color for loading/missing */}
        {displayData.poster_path ? (
            <img
                src={`${IMAGE_BASE_URL_W500}${displayData.poster_path}`}
                alt={`${displayData.title} Poster`}
                className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                loading="lazy" // Lazy load images
            />
         ) : (
            // Placeholder for missing image
             <div className="w-full h-full flex items-center justify-center text-textsecondary/50">
                 <FaFilm /> {/* Or FaTv based on type */}
             </div>
         )}
      </div>

      {/* Add/Remove Button (Top Right) */}
      <button
        className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all duration-200 backdrop-blur-sm ${
          isAdded
            ? "bg-accent/80 text-on-accent hover:bg-accent" // Themed: Added state
            : "bg-black/50 text-textprimary hover:bg-accent focus:bg-accent hover:text-on-accent focus:text-on-accent opacity-0 group-hover:opacity-100 group-focus:opacity-100 focus:opacity-100"
        }`}
        onClick={toggleWatchlist}
        title={isAdded ? "Remove from Watchlist" : "Add to Watchlist"}
      >
        {isAdded ? <FaCheck size={12} /> : <FaPlus size={12} />}
      </button>

      {/* Info Overlay (Bottom) - Themed */}
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
             {/* Optional: Add a play icon or year here if desired */}
         </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;