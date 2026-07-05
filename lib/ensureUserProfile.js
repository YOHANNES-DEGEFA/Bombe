import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { invalidateUsersSearchCache } from "./cachedUsersDirectory";
import { invalidateCachedUser } from "./cachedUsers";
import { getDisplayUsername } from "./userSearchHelpers";

function buildDefaultUsername(authUser) {
  const fromDisplayName = authUser.displayName?.replace(/\s+/g, "").trim();
  if (fromDisplayName && fromDisplayName.length >= 3) return fromDisplayName;

  const emailPrefix = authUser.email?.split("@")[0]?.trim();
  if (emailPrefix && emailPrefix.length >= 3) return emailPrefix;

  return `user${authUser.uid.slice(0, 6)}`;
}

function sanitizeUsername(value) {
  const sanitized = value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24);
  return sanitized.length >= 3 ? sanitized : "";
}

async function isUsernameTaken(usernameLowercase, excludeUid) {
  try {
    const usernameQuery = query(
      collection(db, "users"),
      where("username_lowercase", "==", usernameLowercase)
    );
    const snapshot = await getDocs(usernameQuery);
    return snapshot.docs.some((docSnap) => docSnap.id !== excludeUid);
  } catch (error) {
    console.warn("[UserProfile] Username availability check failed:", error);
    return false;
  }
}

async function resolveUniqueUsername(baseUsername, excludeUid) {
  const candidate =
    sanitizeUsername(baseUsername) || `user${excludeUid.slice(0, 6)}`;

  let username = candidate;
  let attempt = 0;

  while (attempt < 20) {
    const usernameLowercase = username.toLowerCase();
    const taken = await isUsernameTaken(usernameLowercase, excludeUid);
    if (!taken) return { username, usernameLowercase };

    username = `${candidate}${Math.floor(Math.random() * 10000)}`;
    attempt += 1;
  }

  return {
    username: `user${excludeUid.slice(0, 8)}`,
    usernameLowercase: `user${excludeUid.slice(0, 8)}`.toLowerCase(),
  };
}

async function initializeUserCollections(userId) {
  await Promise.all([
    setDoc(doc(db, "friends", userId), { friends: [] }, { merge: true }),
    setDoc(
      doc(db, "favorites", userId),
      { movies: [], shows: [], episodes: [] },
      { merge: true }
    ),
    setDoc(
      doc(db, "history", userId),
      { movies: [], episodes: [] },
      { merge: true }
    ),
    setDoc(doc(db, "watchlists", userId), { items: [] }, { merge: true }),
    setDoc(
      doc(db, "recommendations", userId),
      { movies: [], episodes: [] },
      { merge: true }
    ),
  ]);
}

export async function ensureUserProfile(authUser, preferredUsername) {
  if (!authUser?.uid) return null;

  const userRef = doc(db, "users", authUser.uid);
  const userDoc = await getDoc(userRef);
  const existing = userDoc.exists() ? userDoc.data() : {};

  let username =
    typeof preferredUsername === "string" && preferredUsername.trim()
      ? preferredUsername.trim()
      : typeof existing.username === "string" && existing.username.trim()
        ? existing.username.trim()
        : buildDefaultUsername(authUser);

  const sanitizedPreferred = sanitizeUsername(username);
  if (!sanitizedPreferred) {
    const resolved = await resolveUniqueUsername(
      buildDefaultUsername(authUser),
      authUser.uid
    );
    username = resolved.username;
  } else if (preferredUsername?.trim()) {
    username = sanitizedPreferred;
  } else if (!existing.username) {
    const resolved = await resolveUniqueUsername(username, authUser.uid);
    username = resolved.username;
  } else {
    username = sanitizedPreferred;
  }

  const usernameLowercase = username.toLowerCase();

  const profile = {
    uid: authUser.uid,
    username,
    username_lowercase: usernameLowercase,
    email: authUser.email || existing.email || "",
    avatar: authUser.photoURL || existing.avatar || null,
    createdAt: existing.createdAt || new Date().toISOString(),
  };

  await setDoc(userRef, profile, { merge: true });

  if (!userDoc.exists()) {
    await initializeUserCollections(authUser.uid);
  }

  invalidateCachedUser(authUser.uid);
  invalidateUsersSearchCache();

  return {
    username: profile.username,
    usernameLowercase: profile.username_lowercase,
    displayUsername: getDisplayUsername(profile),
    created: !userDoc.exists(),
  };
}

export async function isUsernameAvailable(username, excludeUid) {
  const trimmed = username.trim();
  if (trimmed.length < 3 || !/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return false;
  }
  return !(await isUsernameTaken(trimmed.toLowerCase(), excludeUid));
}
