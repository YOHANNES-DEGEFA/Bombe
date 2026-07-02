import { useEffect, useState } from "react";
import { doc } from "firebase/firestore";
import { db } from "../firebase";
import { safeGetDoc } from "../lib/firestore";

const cache = new Map();
const DEFAULT_TTL_MS = 2 * 60 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data, ttl) {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

export function useCachedFirestoreDoc(collectionName, userId, defaultValue, ttl = DEFAULT_TTL_MS) {
  const cacheKey = userId ? `${collectionName}:${userId}` : null;
  const cached = cacheKey ? getCached(cacheKey) : null;

  const [data, setData] = useState(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    if (cacheKey) cache.delete(cacheKey);
    setRefreshKey((key) => key + 1);
  };

  useEffect(() => {
    if (!userId) {
      setData(defaultValue);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const stale = getCached(cacheKey);

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
        setCached(cacheKey, nextData, ttl);
        setData(nextData);
      } catch (err) {
        console.error(`Error fetching ${collectionName}:`, err);
        if (!isMounted) return;
        setError(err.message || `Failed to load ${collectionName}.`);
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
  cache.delete(`${collectionName}:${userId}`);
}
