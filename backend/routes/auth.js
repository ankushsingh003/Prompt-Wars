const express = require("express");
const router  = express.Router();
const { auth: fbAuth, db: firestore } = require("../utils/firebase");

// In-memory OTP store (simulation)
const otpStore = new Map();

// POST /api/auth/request-otp — Request OTP for a specific Firebase User
router.post("/request-otp", async (req, res) => {
  const { voterId } = req.body;
  if (!voterId) return res.status(400).json({ error: "Voter ID required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(voterId, { otp, expires: Date.now() + 5 * 60 * 1000 });

  console.log(`[FIREBASE-AUTH] OTP for ${voterId}: ${otp}`);
  res.json({ message: "OTP sent" });
});

// POST /api/auth/verify — Verify OTP and link to Firebase Account
router.post("/verify", async (req, res) => {
  const { voterId, otp, firebaseToken, walletAddress } = req.body;

  try {
    // 1. Verify Firebase Token
    const decodedToken = await fbAuth.verifyIdToken(firebaseToken);
    const uid = decodedToken.uid;

    // 2. Verify OTP
    const stored = otpStore.get(voterId);
    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
      return res.status(401).json({ error: "Invalid or expired OTP" });
    }

    // 3. Link Voter ID and Wallet to Firestore User
    const userRef = firestore.collection("users").doc(uid);
    await userRef.set({
      voterId,
      walletAddress,
      isVerifiedVoter: true,
      lastVerifiedAt: new Date().toISOString()
    }, { merge: true });

    otpStore.delete(voterId);

    res.json({ 
      success: true, 
      message: "Voter identity linked to Firebase account successfully" 
    });

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

module.exports = router;
