import {
  buildUsernamePrefixQuery,
  parseFirestoreDocument,
} from "../../../lib/firestoreRest";

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
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildUsernamePrefixQuery(queryText, maxResults)),
      }
    );

    const payload = await response.json();

    if (!response.ok) {
      console.error("[UserSearch API] Firestore error:", payload);
      const firestoreMessage = payload?.error?.message || "";
      const isPermissionDenied =
        response.status === 403 ||
        firestoreMessage.toLowerCase().includes("permission");

      res.status(response.status).json({
        error: isPermissionDenied
          ? "Firestore blocked user search. Update security rules for the users collection."
          : firestoreMessage || "Search failed.",
      });
      return;
    }

    const lowerCaseQuery = queryText.toLowerCase();
    const users = (Array.isArray(payload) ? payload : [])
      .map(parseFirestoreDocument)
      .filter((user) => user.uid && user.username)
      .filter((user) => {
        const usernameLower = (
          user.username_lowercase ||
          user.username ||
          ""
        ).toLowerCase();
        return usernameLower.startsWith(lowerCaseQuery);
      });

    res.status(200).json({ users });
  } catch (error) {
    console.error("[UserSearch API] Unexpected error:", error);
    res.status(500).json({ error: "Search failed." });
  }
}
