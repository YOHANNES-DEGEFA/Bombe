import {
  CACHE_TTL,
  getMemoryCached,
  setMemoryCached,
  deleteMemoryCached,
  deleteMemoryCachedByPrefix,
} from "./memoryCache";
import { searchUsersInFirestore } from "./userSearch";

const USERS_SEARCH_PREFIX = "users:search:";

export async function searchUsersByUsernamePrefix(
  prefix,
  { excludeUid, maxResults = 20 } = {}
) {
  const trimmed = prefix.trim().toLowerCase();
  if (!trimmed) return [];

  const cacheKey = `${USERS_SEARCH_PREFIX}${trimmed}`;
  let matches = getMemoryCached(cacheKey, CACHE_TTL.usersDirectory);

  if (!matches) {
    matches = await searchUsersInFirestore(trimmed, { maxResults });
    setMemoryCached(cacheKey, matches, CACHE_TTL.usersDirectory);
  }

  if (!excludeUid) return matches;

  return matches.filter((user) => user.uid !== excludeUid);
}

export function invalidateUsersDirectoryCache() {
  deleteMemoryCached("users:directory");
}

export function invalidateUsersSearchCache() {
  deleteMemoryCachedByPrefix(USERS_SEARCH_PREFIX);
}
