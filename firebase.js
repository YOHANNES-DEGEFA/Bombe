import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, enableNetwork } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

let firestoreNetworkReady = Promise.resolve();

function createFirestore() {
  if (typeof window === "undefined") {
    return getFirestore(app);
  }

  let instance;
  try {
    instance = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch {
    instance = getFirestore(app);
  }

  firestoreNetworkReady = enableNetwork(instance).catch(() => {});
  return instance;
}

export const db = createFirestore();

export function waitForFirestoreNetwork() {
  return firestoreNetworkReady;
}

const databaseUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
export const rtdb = databaseUrl ? getDatabase(app, databaseUrl) : null;
