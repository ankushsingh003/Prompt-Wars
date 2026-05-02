const admin = require("firebase-admin");

let db = null;
let auth = null;

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY 
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '') 
      : null;

    if (privateKey && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        })
      });
      console.log("✅ Firebase Admin Initialized");
      db = admin.firestore();
      auth = admin.auth();
    } else {
      console.warn("⚠️ Firebase credentials incomplete. Check your .env file.");
    }
  } catch (error) {
    console.error("❌ Firebase Admin Init Error:", error.message);
  }
} else {
  db = admin.firestore();
  auth = admin.auth();
}

module.exports = { admin, db, auth };
