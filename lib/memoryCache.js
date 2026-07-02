const store = new Map();

export function getMemoryCached(key, ttl) {
  const entry = store.get(key);
  if (!entry) return null;
  const effectiveTtl = ttl ?? entry.ttl;
  if (Date.now() - entry.timestamp > effectiveTtl) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function setMemoryCached(key, data, ttl) {
  store.set(key, { data, timestamp: Date.now(), ttl });
}

export function deleteMemoryCached(key) {
  store.delete(key);
}

export function deleteMemoryCachedByPrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

export const CACHE_TTL = {
  firestore: 5 * 60 * 1000,
  tmdbTrending: 15 * 60 * 1000,
  tmdbDiscover: 30 * 60 * 1000,
  tmdbDetail: 60 * 60 * 1000,
  tmdbDefault: 10 * 60 * 1000,
  userProfile: 5 * 60 * 1000,
  usersDirectory: 3 * 60 * 1000,
  roomsList: 2 * 60 * 1000,
};
