export function getEmailLocalPart(email) {
  if (typeof email !== "string") return "";
  return email.split("@")[0]?.trim().toLowerCase() || "";
}

export function getSearchableUsername(user) {
  const lowercaseField =
    user?.username_lowercase ?? user?.usernameLowercase ?? "";
  if (typeof lowercaseField === "string" && lowercaseField.trim()) {
    return lowercaseField.trim().toLowerCase();
  }
  if (typeof user?.username === "string" && user.username.trim()) {
    return user.username.trim().toLowerCase();
  }
  return getEmailLocalPart(user?.email);
}

export function getDisplayUsername(user) {
  if (typeof user?.username === "string" && user.username.trim()) {
    return user.username.trim();
  }
  const emailPart = getEmailLocalPart(user?.email);
  return emailPart || "User";
}

export function matchesUsernamePrefix(user, prefix) {
  const lowerCasePrefix = prefix.trim().toLowerCase();
  if (!lowerCasePrefix || !user?.uid) return false;
  return getSearchableUsername(user).startsWith(lowerCasePrefix);
}

export function normalizeUserForSearch(user) {
  const username = getDisplayUsername(user);
  const usernameLowercase = getSearchableUsername(user);
  return {
    uid: user.uid,
    username,
    username_lowercase: usernameLowercase,
    email: user.email || "",
    avatar: user.avatar || null,
  };
}
