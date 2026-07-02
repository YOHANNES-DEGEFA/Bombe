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

import {

  CACHE_TTL,

  getMemoryCached,

  setMemoryCached,

  deleteMemoryCached,

} from "../lib/memoryCache";



const WatchlistContext = createContext(null);

const WATCHLIST_CACHE_PREFIX = "watchlist:items:";



export function WatchlistProvider({ children }) {

  const { userId, loading: authLoading } = useAuthContext();

  const cacheKey = userId ? `${WATCHLIST_CACHE_PREFIX}${userId}` : null;

  const cachedItems = cacheKey ? getMemoryCached(cacheKey, CACHE_TTL.firestore) : null;



  const [items, setItems] = useState(cachedItems || []);

  const [loading, setLoading] = useState(!cachedItems && !authLoading);



  const fetchWatchlist = useCallback(async () => {

    if (!userId) {

      setItems([]);

      setLoading(false);

      return;

    }



    const stale = cacheKey ? getMemoryCached(cacheKey, CACHE_TTL.firestore) : null;

    if (stale) {

      setItems(stale);

      setLoading(false);

    } else {

      setLoading(true);

    }



    try {

      const watchlistRef = doc(db, "watchlists", userId);

      const watchlistDoc = await safeGetDoc(watchlistRef);

      const nextItems = watchlistDoc?.exists() ? watchlistDoc.data()?.items || [] : [];

      if (cacheKey) setMemoryCached(cacheKey, nextItems, CACHE_TTL.firestore);

      setItems(nextItems);

    } catch (error) {

      console.error("Error fetching watchlist:", error);

      if (!stale) setItems([]);

    } finally {

      setLoading(false);

    }

  }, [userId, cacheKey]);



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

        const next = [...prev, itemData];

        if (cacheKey) setMemoryCached(cacheKey, next, CACHE_TTL.firestore);

        return next;

      });

      return true;

    },

    [userId, cacheKey]

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

      if (cacheKey) setMemoryCached(cacheKey, updatedItems, CACHE_TTL.firestore);

      setItems(updatedItems);

      return true;

    },

    [userId, cacheKey]

  );



  const refresh = useCallback(() => {

    if (cacheKey) deleteMemoryCached(cacheKey);

    fetchWatchlist();

  }, [cacheKey, fetchWatchlist]);



  const value = useMemo(

    () => ({

      items,

      loading,

      isInWatchlist,

      addToWatchlist,

      removeFromWatchlist,

      refresh,

    }),

    [items, loading, isInWatchlist, addToWatchlist, removeFromWatchlist, refresh]

  );



  return (

    <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>

  );

}



export function useWatchlistContext() {

  return useContext(WatchlistContext);

}


