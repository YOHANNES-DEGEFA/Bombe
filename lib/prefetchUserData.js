import { doc } from "firebase/firestore";
import { db } from "../firebase";
import { safeGetDoc } from "./firestore";
import { CACHE_TTL, getMemoryCached, setMemoryCached } from "./memoryCache";
import { getCachedUser } from "./cachedUsers";
import { prefetchTmdb } from "./tmdb";
import { fetchHomePageData } from "./homeData";

const USER_COLLECTIONS = [
  { name: "favorites", defaultValue: { movies: [], episodes: [], shows: [] } },
  { name: "history", defaultValue: { movies: [], episodes: [] } },
  { name: "recommendations", defaultValue: { movies: [], episodes: [] } },
  { name: "friends", defaultValue: { friends: [] } },
];

async function warmFirestoreDoc(collectionName, userId, defaultValue) {
  const cacheKey = `firestore:${collectionName}:${userId}`;
  if (getMemoryCached(cacheKey, CACHE_TTL.firestore)) return;

  const snapshot = await safeGetDoc(doc(db, collectionName, userId));
  const data = snapshot?.exists() ? snapshot.data() : defaultValue;
  setMemoryCached(cacheKey, data, CACHE_TTL.firestore);
}

async function warmWatchlistItems(userId) {
  const cacheKey = `watchlist:items:${userId}`;
  if (getMemoryCached(cacheKey, CACHE_TTL.firestore)) return;

  const snapshot = await safeGetDoc(doc(db, "watchlists", userId));
  const items = snapshot?.exists() ? snapshot.data()?.items || [] : [];
  setMemoryCached(cacheKey, items, CACHE_TTL.firestore);
}

export async function prefetchUserTabData(userId) {
  if (!userId) return;

  await Promise.all([
    getCachedUser(userId),
    warmWatchlistItems(userId),
    ...USER_COLLECTIONS.map(({ name, defaultValue }) =>
      warmFirestoreDoc(name, userId, defaultValue).catch(() => null)
    ),
    fetchHomePageData().catch(() => null),
  ]);
}
