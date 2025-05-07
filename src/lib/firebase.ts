
import type { FirebaseApp } from 'firebase/app';
// import { initializeApp, getApps } from 'firebase/app'; // No longer importing to prevent auto-init
import type { Firestore } from 'firebase/firestore';
// import { getFirestore } from 'firebase/firestore'; // No longer importing

// Firebase config (can be kept for potential future use, but won't be used now)
/*
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
*/

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// To ensure mock-only operation and prevent Firebase initialization attempts
// that lead to "client is offline" errors, we are not initializing Firebase here.
// `app` and `db` will remain `null`.
// The application logic, especially `bangla-song-database.ts` (when in mock mode),
// should not attempt to use these null `db` or `app` objects.

// If you want to re-enable Firebase later, you would need to:
// 1. Uncomment the imports for `initializeApp`, `getApps`, `getFirestore`.
// 2. Uncomment `firebaseConfig`.
// 3. Implement conditional initialization logic, e.g., based on an environment variable:
/*
const shouldUseFirebase = process.env.NEXT_PUBLIC_USE_FIREBASE === 'true';

if (shouldUseFirebase) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
}
*/

export { app, db };
