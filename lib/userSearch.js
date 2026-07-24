import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../firebase";
import {
  matchesUsernamePrefix,
  normalizeUserForSearch,
} from "./userSearchHelpers";

const USER_SCAN_LIMIT = 500;

function mapUserDoc(docSnap) {
  const data = docSnap.data();
  return { ...data, uid: docSnap.id };
}

export async function searchUsersInFirestore(
  prefix,
  { maxResults = 20 } = {}
) {
  const trimmed = prefix.trim().toLowerCase();
  if (!trimmed) return [];

  const snapshot = await getDocs(
    query(collection(db, "users"), limit(USER_SCAN_LIMIT))
  );

  return snapshot.docs
    .map(mapUserDoc)
    .filter((user) => matchesUsernamePrefix(user, trimmed))
    .slice(0, maxResults)
    .map(normalizeUserForSearch)
    .filter((user) => Boolean(user.uid && user.username_lowercase));
}

export async function countUsersInFirestore() {
  const snapshot = await getDocs(
    query(collection(db, "users"), limit(USER_SCAN_LIMIT))
  );
  return snapshot.size;
}
