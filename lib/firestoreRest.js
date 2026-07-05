function firestoreValueToJs(value) {
  if (!value || typeof value !== "object") return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  return null;
}

export function parseFirestoreDocument(entry) {
  const name = entry?.document?.name || "";
  const uid = name.split("/").pop() || "";
  const fields = entry?.document?.fields || {};
  const data = {};

  for (const [key, value] of Object.entries(fields)) {
    data[key] = firestoreValueToJs(value);
  }

  return { uid, ...data };
}

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
