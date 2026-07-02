import React, { useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useWatchlistContext } from "../../context/WatchlistContext";
import MovieCard from "../../components/MinimalCard";
import { SkeletonCardGridPage } from "../../components/skeleton";
import { useRouter } from "next/router";
import { FaListAlt, FaFilm, FaTv } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import { SeoHead } from "../../components/SeoHead";

const WatchlistPage = () => {
  const { user: currentUser } = useAuth();
  const { items: watchlistItems, loading: loadingWatchlist, error } = useWatchlistContext() ?? { items: [], loading: true, error: null };
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  const filteredItems = useMemo(() => {
    if (!watchlistItems) return [];
    if (filter === "all") return watchlistItems;
    return watchlistItems.filter((item) => item.media_type === filter);
  }, [watchlistItems, filter]);

  if (loadingWatchlist) {
    return <SkeletonCardGridPage titleWidth={36} withTabs tabCount={3} />;
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center px-4 min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl text-accent mb-4">Log In Required</h2>
          <p className="text-textsecondary mb-6">Please log in to view your watchlist.</p>
          <button onClick={() => router.push('/')} className="bg-accent hover:bg-accent-hover text-on-accent font-semibold py-2 px-6 rounded-lg transition-colors">Log In</button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-4 min-h-[60vh]">
        <SeoHead
          title="My Watchlist"
          description="Keep track of all the movies and TV shows you want to watch."
          canonicalPath="/watchList"
          noindex
        />
        <div className="text-center">
          <h2 className="text-2xl text-red-500 mb-4">Error Loading Watchlist</h2>
          <p className="text-textsecondary mb-6">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ className: 'bg-secondary text-textprimary' }} />
      <SeoHead
        title="My Watchlist"
        description="Keep track of all the movies and TV shows you want to watch."
        canonicalPath="/watchList"
        noindex
      />
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-textprimary">My Watchlist</h1>
          <div className="flex items-center gap-2 bg-secondary p-1 rounded-lg border border-secondary-light">
            <button
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${filter === "all" ? "bg-accent text-on-accent shadow" : "text-textsecondary hover:bg-secondary-light hover:text-textprimary"}`}
              onClick={() => setFilter("all")}
              title="Show All"
            > <FaListAlt /> All </button>
            <button
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${filter === "movie" ? "bg-accent text-on-accent shadow" : "text-textsecondary hover:bg-secondary-light hover:text-textprimary"}`}
              onClick={() => setFilter("movie")}
              title="Show Movies Only"
            > <FaFilm /> Movies </button>
            <button
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${filter === "tv" ? "bg-accent text-on-accent shadow" : "text-textsecondary hover:bg-secondary-light hover:text-textprimary"}`}
              onClick={() => setFilter("tv")}
              title="Show TV Shows Only"
            > <FaTv /> TV Shows </button>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredItems.map((item) => (
              <MovieCard
                key={`${item.id}-${item.media_type}`}
                movie={item}
                skipDetailFetch
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-textsecondary bg-secondary rounded-lg shadow">
            <FaListAlt className="mx-auto text-4xl text-textsecondary/50 mb-4" />
            <p className="text-lg mb-2">Your watchlist is empty.</p>
            <p className="text-sm">Add movies and TV shows to see them here.</p>
          </div>
        )}
      </main>
    </>
  );
};

export default WatchlistPage;
