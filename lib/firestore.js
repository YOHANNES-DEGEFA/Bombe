import { getDoc, getDocs } from "firebase/firestore";
import { waitForFirestoreNetwork } from "../firebase";

function isFirestoreOfflineError(error) {
  const code = error?.code;
  const message = (error?.message || "").toLowerCase();
  if (code === "unavailable") return true;
  return message.includes("offline") || message.includes("client is offline");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(operation, maxAttempts = 3) {
  if (typeof window !== "undefined") {
    await waitForFirestoreNetwork();
  }

  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isFirestoreOfflineError(error) || attempt === maxAttempts - 1) {
        break;
      }
      await sleep(300 * (attempt + 1));
    }
  }

  if (isFirestoreOfflineError(lastError)) {
    console.warn("Firestore is offline. Skipping read.");
    return null;
  }

  throw lastError;
}

export async function safeGetDoc(docRef) {
  return withRetry(() => getDoc(docRef));
}

export async function safeGetDocs(queryRef) {
  return withRetry(() => getDocs(queryRef));
}
