import { deleteMemoryCached, deleteMemoryCachedByPrefix } from "./memoryCache";

export function invalidateBuddiesCache(userId) {
  if (!userId) return;
  deleteMemoryCached(`buddies:friends:${userId}`);
  deleteMemoryCached(`buddies:requests:${userId}`);
  deleteMemoryCached(`buddies:sent:${userId}`);
}

export function invalidateAllBuddiesCaches() {
  deleteMemoryCachedByPrefix("buddies:");
}
