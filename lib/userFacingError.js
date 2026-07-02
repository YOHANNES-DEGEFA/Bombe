const AUTH_ERROR_MESSAGES = {
  "auth/invalid-credential": "Incorrect email or password. Please try again.",
  "auth/user-not-found": "Incorrect email or password. Please try again.",
  "auth/wrong-password": "Incorrect email or password. Please try again.",
  "auth/invalid-email": "Invalid email format.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests":
    "Too many attempts. Please try again later or reset your password.",
  "auth/email-already-in-use": "Email already in use. Try signing in.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
  "auth/network-request-failed":
    "Network error. Please check your connection and try again.",
};

const FIRESTORE_ERROR_MESSAGES = {
  "permission-denied": "You don't have permission to do that.",
  unavailable: "Service is temporarily unavailable. Please try again.",
  "not-found": "We couldn't find what you're looking for.",
};

const TECHNICAL_MESSAGE_PATTERNS = [
  /NEXT_PUBLIC_/i,
  /process\.env/i,
  /firebase/i,
  /firestore/i,
  /check console/i,
  /firestore permissions/i,
  /status_code/i,
  /request failed with status code/i,
  /\.js:\d+/i,
  /\bat\s+\w+/i,
  /ECONNREFUSED/i,
  /invalid api key/i,
  /tmdb/i,
];

function isNetworkError(error) {
  if (!error || typeof error !== "object") return false;
  return (
    error.code === "ERR_NETWORK" ||
    error.code === "auth/network-request-failed" ||
    (Boolean(error.request) && !error.response)
  );
}

function looksTechnical(message) {
  if (!message || typeof message !== "string") return true;
  return TECHNICAL_MESSAGE_PATTERNS.some((pattern) => pattern.test(message));
}

function isNotFoundMessage(message) {
  if (!message || typeof message !== "string") return false;
  return /not found/i.test(message);
}

export function logAppError(context, error) {
  console.error(`[${context}]`, error);
}

export function getAuthErrorMessage(
  error,
  fallback = "Sign in failed. Please try again."
) {
  if (!error) return fallback;
  if (typeof error === "string") {
    return looksTechnical(error) ? fallback : error;
  }
  if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }
  return getUserFacingMessage(error, fallback);
}

export function getFirestoreErrorMessage(
  error,
  fallback = "Something went wrong. Please try again."
) {
  if (!error) return fallback;
  if (typeof error === "string") {
    return looksTechnical(error) ? fallback : error;
  }
  if (error.code && FIRESTORE_ERROR_MESSAGES[error.code]) {
    return FIRESTORE_ERROR_MESSAGES[error.code];
  }
  return getUserFacingMessage(error, fallback);
}

export function getApiErrorMessage(
  error,
  fallback = "Something went wrong. Please try again."
) {
  if (!error) return fallback;
  if (typeof error === "string") {
    return looksTechnical(error) ? fallback : error;
  }

  if (isNetworkError(error)) {
    return "Network error. Please check your connection and try again.";
  }

  if (error.response?.status === 404 || isNotFoundMessage(error.message)) {
    return "We couldn't find what you're looking for.";
  }

  if (error.response?.status >= 500) {
    return "Our servers are having trouble. Please try again later.";
  }

  const apiMessage = error.response?.data?.status_message;
  if (apiMessage && !looksTechnical(apiMessage)) {
    return apiMessage;
  }

  return getUserFacingMessage(error, fallback);
}

export function getUserFacingMessage(
  error,
  fallback = "Something went wrong. Please try again."
) {
  if (!error) return fallback;

  if (typeof error === "string") {
    if (isNotFoundMessage(error)) {
      return "We couldn't find what you're looking for.";
    }
    return looksTechnical(error) ? fallback : error;
  }

  if (error.code?.startsWith("auth/")) {
    return getAuthErrorMessage(error, fallback);
  }

  if (error.code && FIRESTORE_ERROR_MESSAGES[error.code]) {
    return FIRESTORE_ERROR_MESSAGES[error.code];
  }

  if (isNetworkError(error)) {
    return "Network error. Please check your connection and try again.";
  }

  if (error.response?.status === 404) {
    return "We couldn't find what you're looking for.";
  }

  if (error.response?.status >= 500) {
    return "Our servers are having trouble. Please try again later.";
  }

  const message = error.message;
  if (message) {
    if (isNotFoundMessage(message)) {
      return "We couldn't find what you're looking for.";
    }
    if (!looksTechnical(message)) {
      return message;
    }
  }

  return fallback;
}
