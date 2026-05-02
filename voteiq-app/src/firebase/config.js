import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app;
let auth;
let db;
let analytics;
const googleProvider = new GoogleAuthProvider();

// Safe initialization
try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    // Analytics is optional and can fail in local dev
    try { analytics = getAnalytics(app); } catch (e) { console.warn("Analytics not initialized"); }
    console.log("✅ Firebase Initialized");
  } else {
    console.warn("⚠️ Firebase API Key missing. Auth and Firestore will be disabled.");
    // Fallback to null or dummy objects to prevent crashes
    app = {};
    auth = { onAuthStateChanged: (cb) => { cb(null); return () => {}; } };
    db = {};
  }
} catch (error) {
  console.error("❌ Firebase Init Error:", error.message);
  auth = { onAuthStateChanged: (cb) => { cb(null); return () => {}; } };
}

export { auth, db, analytics, googleProvider };
export default app;
