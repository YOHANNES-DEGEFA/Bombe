import { useEffect, useState } from "react";
import { doc } from "firebase/firestore";
import { db } from "../firebase";
import { safeGetDoc } from "../lib/firestore";
import {
  CACHE_TTL,
  getMemoryCached,
  setMemoryCached,
  deleteMemoryCached,
} from "../lib/memoryCache";
import { getFirestoreErrorMessage, logAppError } from "../lib/userFacingError";

export function useCachedFirestoreDoc(
  collectionName,
  userId,
  defaultValue,
  ttl = CACHE_TTL.firestore
) {
  const cacheKey = userId ? `firestore:${collectionName}:${userId}` : null;
  const cached = cacheKey ? getMemoryCached(cacheKey, ttl) : null;

  const [data, setData] = useState(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    if (cacheKey) deleteMemoryCached(cacheKey);
    setRefreshKey((key) => key + 1);
  };

  useEffect(() => {
    if (!userId) {
      setData(defaultValue);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const stale = getMemoryCached(cacheKey, ttl);

    if (stale) {
      setData(stale);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const fetchDoc = async () => {
      setError(null);
      try {
        const docRef = doc(db, collectionName, userId);
        const snapshot = await safeGetDoc(docRef);
        const nextData = snapshot?.exists() ? snapshot.data() : defaultValue;
        if (!isMounted) return;
        setMemoryCached(cacheKey, nextData, ttl);
        setData(nextData);
      } catch (err) {
        logAppError(`${collectionName} doc`, err);
        if (!isMounted) return;
        setError(
          getFirestoreErrorMessage(
            err,
            "We couldn't load your data. Please try again."
          )
        );
        if (!stale) setData(defaultValue);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDoc();
    return () => {
      isMounted = false;
    };
  }, [collectionName, userId, cacheKey, defaultValue, ttl, refreshKey]);

  return { data, loading, error, refresh };
}

export function invalidateFirestoreDocCache(collectionName, userId) {
  if (!userId) return;
  deleteMemoryCached(`firestore:${collectionName}:${userId}`);
}
