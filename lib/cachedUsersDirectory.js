import { collection, limit, query } from "firebase/firestore";
import { db } from "../firebase";
import { safeGetDocs } from "./firestore";
import {
  CACHE_TTL,
  getMemoryCached,
  setMemoryCached,
  deleteMemoryCached,
} from "./memoryCache";

const USERS_DIRECTORY_KEY = "users:directory";

export async function getCachedUsersDirectory() {
  const cached = getMemoryCached(USERS_DIRECTORY_KEY, CACHE_TTL.usersDirectory);
  if (cached) return cached;

  const usersQuery = query(collection(db, "users"), limit(100));
  const usersSnapshot = await safeGetDocs(usersQuery);
  const users = (usersSnapshot?.docs || []).map((docSnap) => ({
    uid: docSnap.id,
    ...docSnap.data(),
  }));

  setMemoryCached(USERS_DIRECTORY_KEY, users, CACHE_TTL.usersDirectory);
  return users;
}

export function invalidateUsersDirectoryCache() {
  deleteMemoryCached(USERS_DIRECTORY_KEY);
}
