
import type { FirebaseApp } from 'firebase/app';
// import { initializeApp, getApps } from 'firebase/app'; // No longer importing to prevent auto-init
import type { Firestore } from 'firebase/firestore';
// import { getFirestore } from 'firebase/firestore'; // No longer importing

// Firebase config (can be kept for potential future use, but won't be used now)
/*
// 1. Asegúrate de que las variables de entorno estén en .env.local
// NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
// NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
// NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
// NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id (opcional)

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
// 2. Uncomment `firebaseConfig` above and ensure your .env.local has the correct values.
// 3. Implement conditional initialization logic here:
/*
const shouldUseFirebase = process.env.NEXT_PUBLIC_USE_FIREBASE === 'true'; // Example env variable to toggle Firebase

if (shouldUseFirebase) {
  if (!getApps().length) {
    if (firebaseConfig.apiKey && firebaseConfig.projectId) { // Check if config is populated
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
    } else {
      console.warn("Firebase config is missing. Firebase will not be initialized.");
    }
  } else {
    app = getApps()[0];
    db = getFirestore(app);
  }
}
*/

// For Firebase Emulators, you might need to connect to them when running locally:
/*
if (shouldUseFirebase && process.env.NODE_ENV === 'development') {
  const { connectFirestoreEmulator } = await import('firebase/firestore'); // Dynamic import
  if (db) { // Ensure db is initialized before connecting to emulator
    try {
      connectFirestoreEmulator(db, 'localhost', 8080); // Default Firestore emulator port
      console.log("Connected to Firestore Emulator");
    } catch (e) {
      console.warn("Could not connect to Firestore Emulator:", e);
    }
  }
  // Similarly, connectAuthEmulator, connectFunctionsEmulator, etc.
}
*/


export { app, db };
