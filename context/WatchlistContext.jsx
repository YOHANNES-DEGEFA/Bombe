import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { safeGetDoc } from "../lib/firestore";
import { useAuthContext } from "./AuthContext";

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const { userId, loading: authLoading } = useAuthContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const watchlistRef = doc(db, "watchlists", userId);
      const watchlistDoc = await safeGetDoc(watchlistRef);
      setItems(watchlistDoc?.exists() ? watchlistDoc.data()?.items || [] : []);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;
    fetchWatchlist();
  }, [authLoading, fetchWatchlist]);

  const isInWatchlist = useCallback(
    (id, mediaType) =>
      items.some((item) => item.id === id && item.media_type === mediaType),
    [items]
  );

  const addToWatchlist = useCallback(
    async (itemData) => {
      if (!userId) return false;
      const watchlistRef = doc(db, "watchlists", userId);
      const watchlistDoc = await safeGetDoc(watchlistRef);
      if (watchlistDoc?.exists()) {
        await updateDoc(watchlistRef, { items: arrayUnion(itemData) });
      } else {
        await setDoc(watchlistRef, { items: [itemData] });
      }
      setItems((prev) => {
        if (prev.some((item) => item.id === itemData.id && item.media_type === itemData.media_type)) {
          return prev;
        }
        return [...prev, itemData];
      });
      return true;
    },
    [userId]
  );

  const removeFromWatchlist = useCallback(
    async (id, mediaType) => {
      if (!userId) return false;
      const watchlistRef = doc(db, "watchlists", userId);
      const watchlistDoc = await safeGetDoc(watchlistRef);
      if (!watchlistDoc?.exists()) return false;
      const currentItems = watchlistDoc.data()?.items || [];
      const updatedItems = currentItems.filter(
        (item) => !(item.id === id && item.media_type === mediaType)
      );
      await updateDoc(watchlistRef, { items: updatedItems });
      setItems(updatedItems);
      return true;
    },
    [userId]
  );

  const value = useMemo(
    () => ({
      items,
      loading,
      isInWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      refresh: fetchWatchlist,
    }),
    [items, loading, isInWatchlist, addToWatchlist, removeFromWatchlist, fetchWatchlist]
  );

  return (
    <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
  );
}

export function useWatchlistContext() {
  return useContext(WatchlistContext);
}
