import {
  buildUsernamePrefixQuery,
  buildUsersListQuery,
  entriesToUsers,
  matchesUsernamePrefix,
  normalizeUserForSearch,
  runFirestoreStructuredQuery,
} from "../../../lib/firestoreRest";

const FALLBACK_SCAN_LIMIT = 500;

export default async function handler(req, res) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    res.status(503).json({ error: "Firebase project is not configured." });
    return;
  }

  const idToken = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  if (!idToken) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const queryText = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!queryText) {
    res.status(400).json({ error: "Search query is required." });
    return;
  }

  const maxResults = Math.min(
    Math.max(parseInt(req.query.limit, 10) || 20, 1),
    50
  );

  try {
    let matchedUsers = [];

    try {
      const prefixEntries = await runFirestoreStructuredQuery(
        projectId,
        idToken,
        buildUsernamePrefixQuery(queryText, maxResults)
      );
      matchedUsers = entriesToUsers(prefixEntries).filter((user) =>
        matchesUsernamePrefix(user, queryText)
      );
    } catch (prefixError) {
      console.warn(
        "[UserSearch API] Prefix query failed, using fallback scan:",
        prefixError.message
      );
    }

    if (matchedUsers.length === 0) {
      const listEntries = await runFirestoreStructuredQuery(
        projectId,
        idToken,
        buildUsersListQuery(FALLBACK_SCAN_LIMIT)
      );
      matchedUsers = entriesToUsers(listEntries).filter((user) =>
        matchesUsernamePrefix(user, queryText)
      );
    }

    const users = matchedUsers
      .slice(0, maxResults)
      .map(normalizeUserForSearch)
      .filter((user) => user.username_lowercase);

    res.status(200).json({ users });
  } catch (error) {
    console.error("[UserSearch API] Unexpected error:", error);
    const isPermissionDenied =
      error.status === 403 ||
      String(error.message || "").toLowerCase().includes("permission");

    res.status(error.status || 500).json({
      error: isPermissionDenied
        ? "Firestore blocked user search. Update security rules for the users collection."
        : error.message || "Search failed.",
    });
  }
}
