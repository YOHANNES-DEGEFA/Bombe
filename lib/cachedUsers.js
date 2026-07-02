import { doc } from "firebase/firestore";
import { db } from "../firebase";
import { safeGetDoc } from "./firestore";
import {
  CACHE_TTL,
  getMemoryCached,
  setMemoryCached,
  deleteMemoryCached,
} from "./memoryCache";

export async function getCachedUser(userId) {
  if (!userId) return null;

  const cacheKey = `user:${userId}`;
  const cached = getMemoryCached(cacheKey, CACHE_TTL.userProfile);
  if (cached) return cached;

  const userDoc = await safeGetDoc(doc(db, "users", userId));
  if (!userDoc?.exists()) return null;

  const profile = { uid: userId, ...userDoc.data() };
  setMemoryCached(cacheKey, profile, CACHE_TTL.userProfile);
  return profile;
}

export async function getCachedUsers(userIds) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  const profiles = await Promise.all(uniqueIds.map((id) => getCachedUser(id)));
  return profiles.filter(Boolean);
}

export function buildUsernameMap(profiles) {
  return profiles.reduce((map, profile) => {
    if (profile?.uid) {
      map[profile.uid] = profile.username || "Unknown User";
    }
    return map;
  }, {});
}

export function invalidateCachedUser(userId) {
  if (!userId) return;
  deleteMemoryCached(`user:${userId}`);
}
