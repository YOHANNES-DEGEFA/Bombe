import React, { useState } from "react";
import { auth, db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import StatsCard from "../../components/StatsCard";
import { SkeletonProfilePage } from "../../components/skeleton";
import toast, { Toaster } from 'react-hot-toast';
import { FaEdit, FaSave, FaSignOutAlt } from "react-icons/fa";
import { SeoHead } from "../../components/SeoHead";
import { motion } from "framer-motion";
import { useProfileData } from "../../hooks/useProfileData";
import { invalidateCachedUser } from "../../lib/cachedUsers";
import { invalidateUsersSearchCache } from "../../lib/cachedUsersDirectory";
// Genre Map (Ensure this covers IDs present in your data, including TV genres)
const genreMap = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", // Abbreviated
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
    // Common TV Genres (add more as needed)
    10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
    10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics",
};


export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();
  const {
    currentUser,
    userData,
    setUserData,
    stats,
    loading,
    error,
  } = useProfileData(genreMap);

  React.useEffect(() => {
    if (userData?.username) setUsername(userData.username);
  }, [userData?.username]);

  React.useEffect(() => {
    if (!loading && !currentUser) {
      toast.error("Please log in to view your profile.");
      router.push("/");
    }
  }, [loading, currentUser, router]);

  // Handle Save Username
  const handleSave = async () => {
    if (!currentUser || !username.trim()) {
        toast.error("Username cannot be empty.");
        return;
    }
     if (username.trim() === userData?.username) {
         setIsEditing(false); // No changes made
         return;
     }

     const userRef = doc(db, "users", currentUser.uid);
     const savingToast = toast.loading("Saving username...");

    try {
        await updateDoc(userRef, {
            username: username.trim(),
             // Also update lowercase version if used for searching elsewhere
             username_lowercase: username.trim().toLowerCase(),
        });
        // Optimistically update local state first for better UX
        setUserData((prev) => ({ ...prev, username: username.trim() }));
        invalidateCachedUser(currentUser.uid);
        invalidateUsersSearchCache();
        toast.success("Username updated!", { id: savingToast });
        setIsEditing(false);
    } catch(err) {
         console.error("Error updating username:", err);
         toast.error("Failed to update username.", { id: savingToast });
    }
  };

  // Handle Logout
  const handleLogout = async () => {
     const loggingOutToast = toast.loading("Logging out...");
     try {
        await signOut(auth);
        toast.success("Logged out successfully.", { id: loggingOutToast });
        router.push("/"); // Redirect to homepage after logout
     } catch (err) {
         console.error("Logout error:", err);
         toast.error("Logout failed. Please try again.", { id: loggingOutToast });
     }
  };

  const handleRetryProfile = () => {
    router.replace(router.asPath);
  };

  if (loading) {
    return <SkeletonProfilePage />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-4 min-h-[60vh]">
        <SeoHead title="Profile" description="Manage your Bombe profile." canonicalPath="/profile" noindex />
        <Toaster position="bottom-center" toastOptions={{ className: "bg-secondary text-textprimary" }} />
        <div className="text-center max-w-md">
          <h2 className="text-2xl text-red-500 mb-4">Error Loading Profile</h2>
          <p className="text-textsecondary mb-6">{error}</p>
          <p className="text-textsecondary text-sm mb-6">
            Your login exists in Firebase Authentication, but your Firestore profile could not be loaded or created. Check Firestore security rules allow creating documents in the users collection.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={handleRetryProfile}
              className="h-[40px] px-4 rounded-md bg-accent text-on-accent hover:bg-accent-hover transition-colors"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="h-[40px] px-4 rounded-md border border-secondary-light bg-transparent hover:bg-secondary-light transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 md:p-6">
      <SeoHead title="Profile" description="Manage your Bombe profile and preferences." canonicalPath="/profile" noindex />
      <Toaster position="bottom-center" toastOptions={{ className: 'bg-secondary text-textprimary',}} />
       {/* Main Profile Card - Themed */}
      <div className="bg-secondary p-6 md:p-8 rounded-xl shadow-lg w-full max-w-3xl border border-secondary-light flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-textprimary">Profile</h1>

        {/* Avatar */}
        <img
            src={userData?.avatar || `https://www.gravatar.com/avatar/${currentUser?.uid}?d=mp&f=y`} // Use UID for Gravatar seed, or userData.avatar
            alt="User Avatar"
            className="w-24 h-24 rounded-full mb-4 border-4 border-secondary-light shadow-md"
        />

        <div className="w-full max-w-xs text-center mb-6"> {/* Container for info/edit */}
          {isEditing ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-3">
              {/* Themed Input */}
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-primary border border-secondary-light rounded-lg text-textprimary placeholder-textsecondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                placeholder="Enter new username"
              />
              {/* Themed Save Button */}
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 bg-accent text-on-accent font-semibold py-2 rounded-lg hover:bg-accent-hover transition-colors duration-200"
              >
                 <FaSave /> Save Changes
              </button>
               {/* Cancel Button */}
               <button
                onClick={() => { setIsEditing(false); setUsername(userData?.username || ""); }} // Reset username on cancel
                className="w-full text-sm text-textsecondary hover:text-textprimary transition-colors"
              > Cancel </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-3">
               {/* Themed Display Text */}
              <div className="text-center">
                <p className="text-xl font-semibold text-textprimary">{userData?.username || "Username not set"}</p>
                <p className="text-sm text-textsecondary mt-1">{currentUser?.email || 'Email not available'}</p>
              </div>
               {/* Themed Edit Button */}
              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 border border-accent/50 text-accent font-medium py-2 px-6 rounded-lg hover:bg-accent/10 hover:text-accent-hover transition-all duration-200"
              >
                <FaEdit /> Edit Username
              </button>
            </motion.div>
          )}
        </div>

        {/* Stats Section - Themed */}
        <div className="w-full border-t border-secondary-light pt-6 mt-6">
             <h2 className="text-lg font-semibold text-textprimary mb-4 text-center">Your Stats</h2>
             {/* Updated Grid Columns for better responsiveness */}
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5 w-full">
               <StatsCard title="Buddies" value={stats.buddies} />
               <StatsCard title="Movies Watched" value={stats.moviesWatched} />
               <StatsCard title="Episodes Watched" value={stats.episodesWatched} />
               <StatsCard title="Favorite Movies" value={stats.favoriteMovies} />
                {/* Assuming favoriteShows was added */}
               <StatsCard title="Favorite Shows" value={stats.favoriteShows} />
               <StatsCard title="Favorite Episodes" value={stats.favoriteEpisodes} />
               {/* Make Top Genre span 2 cols on smallest screens if 6 items look odd */}
               <div className="sm:col-span-1">
                    <StatsCard title="Top Genre" value={stats.topGenre} />
               </div>
             </div>
        </div>


        {/* Logout Button - Themed */}
        <button
          onClick={handleLogout}
          className="mt-8 flex items-center justify-center gap-2 border border-red-600/50 text-red-300 font-medium py-2 px-6 rounded-lg hover:bg-red-700/20 hover:text-red-200 transition-all duration-200"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
}