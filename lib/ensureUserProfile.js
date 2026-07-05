import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { invalidateUsersSearchCache } from "./cachedUsersDirectory";
import { invalidateCachedUser } from "./cachedUsers";

function buildDefaultUsername(authUser) {
  const fromDisplayName = authUser.displayName?.replace(/\s+/g, "").trim();
  if (fromDisplayName && fromDisplayName.length >= 3) return fromDisplayName;

  const emailPrefix = authUser.email?.split("@")[0]?.trim();
  if (emailPrefix && emailPrefix.length >= 3) return emailPrefix;

  return `user${authUser.uid.slice(0, 6)}`;
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
  const sanitized = baseUsername.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24);
  const candidate =
    sanitized.length >= 3 ? sanitized : `user${excludeUid.slice(0, 6)}`;

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
  let profileChanged = false;

  if (!userDoc.exists()) {
    const baseUsername = preferredUsername?.trim() || buildDefaultUsername(authUser);
    const { username, usernameLowercase } = await resolveUniqueUsername(
      baseUsername,
      authUser.uid
    );

    await setDoc(userRef, {
      uid: authUser.uid,
      username,
      username_lowercase: usernameLowercase,
      email: authUser.email || "",
      avatar: authUser.photoURL || null,
      createdAt: new Date().toISOString(),
    });
    await initializeUserCollections(authUser.uid);
    invalidateCachedUser(authUser.uid);
    invalidateUsersSearchCache();
    return { username, usernameLowercase, created: true };
  }

  const data = userDoc.data();
  const updates = {};

  let username =
    typeof preferredUsername === "string" && preferredUsername.trim()
      ? preferredUsername.trim()
      : typeof data.username === "string"
        ? data.username.trim()
        : "";

  if (!username) {
    const resolved = await resolveUniqueUsername(
      buildDefaultUsername(authUser),
      authUser.uid
    );
    username = resolved.username;
    updates.username = resolved.username;
    updates.username_lowercase = resolved.usernameLowercase;
    profileChanged = true;
  } else if (!data.username_lowercase || data.username_lowercase !== username.toLowerCase()) {
    updates.username_lowercase = username.toLowerCase();
    profileChanged = true;
  }

  if (!data.email && authUser.email) {
    updates.email = authUser.email;
    profileChanged = true;
  }

  if (!data.avatar && authUser.photoURL) {
    updates.avatar = authUser.photoURL;
    profileChanged = true;
  }

  if (profileChanged) {
    await updateDoc(userRef, updates);
    invalidateCachedUser(authUser.uid);
    invalidateUsersSearchCache();
  }

  return {
    username: username || data.username,
    usernameLowercase: (updates.username_lowercase || data.username_lowercase || username.toLowerCase()),
    created: false,
  };
}

export async function isUsernameAvailable(username, excludeUid) {
  const trimmed = username.trim();
  if (trimmed.length < 3 || !/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return false;
  }
  return !(await isUsernameTaken(trimmed.toLowerCase(), excludeUid));
}
