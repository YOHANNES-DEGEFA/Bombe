import {
  matchesUsernamePrefix,
  normalizeUserForSearch,
} from "./userSearchHelpers";

function firestoreValueToJs(value) {
  if (!value || typeof value !== "object") return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue;
  return null;
}

export function parseFirestoreDocument(entry) {
  if (!entry?.document) return null;

  const name = entry.document.name || "";
  const uid = name.split("/").pop() || "";
  if (!uid) return null;

  const fields = entry.document.fields || {};
  const data = {};

  for (const [key, value] of Object.entries(fields)) {
    data[key] = firestoreValueToJs(value);
  }

  return { uid, ...data };
}

export function entriesToUsers(entries) {
  return (Array.isArray(entries) ? entries : [])
    .map(parseFirestoreDocument)
    .filter(Boolean);
}

export { matchesUsernamePrefix, normalizeUserForSearch };

export function buildUsernamePrefixQuery(prefix, maxResults) {
  const trimmed = prefix.trim().toLowerCase();
  return {
    structuredQuery: {
      from: [{ collectionId: "users" }],
      orderBy: [
        {
          field: { fieldPath: "username_lowercase" },
          direction: "ASCENDING",
        },
      ],
      startAt: {
        values: [{ stringValue: trimmed }],
      },
      endAt: {
        values: [{ stringValue: `${trimmed}\uf8ff` }],
      },
      limit: maxResults,
    },
  };
}

export function buildUsersListQuery(maxResults) {
  return {
    structuredQuery: {
      from: [{ collectionId: "users" }],
      limit: maxResults,
    },
  };
}

export async function runFirestoreStructuredQuery(
  projectId,
  idToken,
  structuredQuery
) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(structuredQuery),
    }
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error?.message || "Firestore query failed.";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return Array.isArray(payload) ? payload : [];
}
