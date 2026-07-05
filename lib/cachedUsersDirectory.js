import { collection, limit, query } from "firebase/firestore";
import { db } from "../firebase";
import { safeGetDocs } from "./firestore";
import {
  CACHE_TTL,
  getMemoryCached,
  setMemoryCached,
  deleteMemoryCached,
  deleteMemoryCachedByPrefix,
} from "./memoryCache";

const USERS_DIRECTORY_KEY = "users:directory";
const USERS_SEARCH_PREFIX = "users:search:";

export async function getCachedUsersDirectory() {
  const cached = getMemoryCached(USERS_DIRECTORY_KEY, CACHE_TTL.usersDirectory);
  if (cached) return cached;

  const usersQuery = query(collection(db, "users"), limit(100));
  const usersSnapshot = await safeGetDocs(usersQuery);
  if (!usersSnapshot) return [];

  const users = usersSnapshot.docs.map((docSnap) => ({
    uid: docSnap.id,
    ...docSnap.data(),
  }));

  setMemoryCached(USERS_DIRECTORY_KEY, users, CACHE_TTL.usersDirectory);
  return users;
}

export async function searchUsersByUsernamePrefix(
  prefix,
  { excludeUid, maxResults = 20, idToken } = {}
) {
  const trimmed = prefix.trim().toLowerCase();
  if (!trimmed) return [];

  if (!idToken) {
    throw new Error("Authentication required for user search.");
  }

  const cacheKey = `${USERS_SEARCH_PREFIX}${trimmed}`;
  const cached = getMemoryCached(cacheKey, CACHE_TTL.usersDirectory);
  if (cached && cached.length > 0) {
    return cached.filter((user) => user.uid !== excludeUid);
  }

  const params = new URLSearchParams({
    q: trimmed,
    limit: String(maxResults),
    _: String(Date.now()),
  });

  const response = await fetch(`/api/users/search?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Cache-Control": "no-cache",
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error || "Search failed.";
    throw new Error(message);
  }

  const users = Array.isArray(payload.users) ? payload.users : [];

  if (users.length > 0) {
    setMemoryCached(cacheKey, users, CACHE_TTL.usersDirectory);
  }

  return users.filter((user) => user.uid !== excludeUid);
}

export function invalidateUsersDirectoryCache() {
  deleteMemoryCached(USERS_DIRECTORY_KEY);
}

export function invalidateUsersSearchCache() {
  deleteMemoryCachedByPrefix(USERS_SEARCH_PREFIX);
}
