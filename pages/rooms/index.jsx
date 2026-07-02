import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import CreateRoomModal from "../../components/CreateRoomModal";
import { SkeletonRoomsPage } from "../../components/skeleton";
import { FaPlus, FaUsers, FaClock, FaCrown } from "react-icons/fa";
import TimeAgo from "react-timeago";
import { SeoHead } from "../../components/SeoHead";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import { getCachedUsers, buildUsernameMap } from "../../lib/cachedUsers";
import { CACHE_TTL, getMemoryCached, setMemoryCached } from "../../lib/memoryCache";

const ROOMS_CACHE_KEY = "rooms:all";

const RoomsPage = () => {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const cachedRooms = getMemoryCached(ROOMS_CACHE_KEY, CACHE_TTL.roomsList);
  const [allRooms, setAllRooms] = useState(cachedRooms || []);
  const [loadingRooms, setLoadingRooms] = useState(!cachedRooms);
  const [creatorUsernames, setCreatorUsernames] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);

    const roomsCollectionRef = collection(db, "rooms");
    const q = query(roomsCollectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        const fetchedRoomsData = querySnapshot.docs.map((roomDoc) => ({
          id: roomDoc.id,
          ...roomDoc.data(),
          createdAt: roomDoc.data().createdAt?.toDate
            ? roomDoc.data().createdAt.toDate()
            : null,
        }));

        setAllRooms(fetchedRoomsData);
        setMemoryCached(ROOMS_CACHE_KEY, fetchedRoomsData, CACHE_TTL.roomsList);

        if (fetchedRoomsData.length > 0) {
          const creatorIdsToFetch = [
            ...new Set(
              fetchedRoomsData
                .map((room) => room.createdBy)
                .filter(Boolean)
            ),
          ];

          if (creatorIdsToFetch.length > 0) {
            const profiles = await getCachedUsers(creatorIdsToFetch);
            setCreatorUsernames((prev) => ({
              ...prev,
              ...buildUsernameMap(profiles),
            }));
          }
        }

        setLoadingRooms(false);
      },
      (snapshotError) => {
        console.error("Error fetching rooms:", snapshotError);
        setError("Could not load rooms. Check Firestore permissions.");
        toast.error("Could not load rooms.");
        setLoadingRooms(false);
        if (!cachedRooms) {
          setAllRooms([]);
          setCreatorUsernames({});
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const userRooms = useMemo(() => {
    if (!currentUser) return [];
    return allRooms.filter((room) => room.members?.includes(currentUser.uid));
  }, [allRooms, currentUser]);

  const openModal = () => {
    if (!currentUser) {
      toast.error("Please log in to create a room.");
      return;
    }
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  if (loadingRooms && allRooms.length === 0) {
    return <SkeletonRoomsPage />;
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center px-4 min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl text-accent mb-4">Log In Required</h2>
          <p className="text-textsecondary mb-6">
            Please log in to view or create watch party rooms.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-accent hover:bg-accent-hover text-on-accent font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SeoHead title="Watch Party Rooms" description="Create and join watch party rooms on Bombe." canonicalPath="/rooms" noindex />
      <Toaster
        position="bottom-center"
        toastOptions={{ className: "bg-secondary text-textprimary" }}
      />
      <main className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-textprimary">
            Your Watch Party Rooms
          </h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={openModal}
            className="bg-accent hover:bg-accent-hover text-on-accent font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-md"
          >
            <FaPlus /> Create Room
          </motion.button>
        </div>

        {error && !loadingRooms && (
          <div className="text-center py-10 text-red-400 bg-secondary rounded-lg shadow">
            <p>Error loading rooms: {error}</p>
          </div>
        )}

        {!loadingRooms && !error && userRooms.length === 0 && (
          <div className="text-center py-16 text-textsecondary bg-secondary rounded-lg shadow">
            <FaUsers className="mx-auto text-4xl text-textsecondary/50 mb-4" />
            <p className="text-lg mb-2">No rooms found.</p>
            <p className="text-sm">
              You haven't joined or created any rooms yet.
            </p>
            <button
              onClick={openModal}
              className="mt-4 text-accent hover:text-accent-hover font-medium underline"
            >
              Create your first room?
            </button>
          </div>
        )}

        {!loadingRooms && !error && userRooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {userRooms.map((room) => (
              <Link
                href={`/rooms/${room.id}`}
                key={room.id}
                className="block group"
              >
                <motion.div
                  whileHover={{
                    y: -5,
                    boxShadow:
                      "0 10px 15px -3px rgba(218, 165, 32, 0.1), 0 4px 6px -4px rgba(218, 165, 32, 0.1)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-secondary rounded-lg shadow-lg p-4 border border-secondary-light transition-all duration-300 h-full flex flex-col justify-between"
                >
                  <div>
                    <h2
                      className="text-lg font-semibold text-textprimary truncate mb-2 group-hover:text-accent transition-colors"
                      title={room.name}
                    >
                      {room.name}
                    </h2>
                    <div className="text-xs text-textsecondary space-y-1.5">
                      <p className="flex items-center gap-1.5">
                        <FaUsers /> {room.members?.length || 0} Member(s)
                      </p>
                      <p className="flex items-center gap-1.5">
                        <FaCrown className="text-yellow-500/80" /> Created by{" "}
                        {creatorUsernames[room.createdBy] || "..."}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <FaClock /> <TimeAgo date={room.createdAt} />
                      </p>
                    </div>
                  </div>
                  {room.currentMediaId && (
                    <div className="mt-3 pt-2 border-t border-secondary-light/50">
                      <p
                        className="text-xs text-accent/90 italic truncate"
                        title={`Watching: ${room.currentMediaTitle || "..."}`}
                      >
                        Watching: {room.currentMediaTitle || "..."}
                      </p>
                    </div>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};

export default RoomsPage;
