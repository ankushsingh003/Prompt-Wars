const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const { ethers } = require("ethers");

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

// POST /api/auth/request-otp — Simulate Aadhaar OTP (replace with real API)
router.post("/request-otp", async (req, res) => {
  const { voterId } = req.body; // Voter ID card number
  if (!voterId) return res.status(400).json({ error: "Voter ID required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(voterId, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 min

  // TODO: Send via real SMS gateway (Twilio, MSG91, etc.)
  console.log(`[DEV] OTP for ${voterId}: ${otp}`);

  res.json({ message: "OTP sent (check console in dev)" });
});

// POST /api/auth/verify — Verify OTP + wallet address, return JWT
router.post("/verify", async (req, res) => {
  const { voterId, otp, walletAddress } = req.body;

  const stored = otpStore.get(voterId);
  if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
    return res.status(401).json({ error: "Invalid or expired OTP" });
  }

  // Validate wallet address format
  if (!ethers.isAddress(walletAddress)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }

  otpStore.delete(voterId);

  // Issue JWT linking voter ID to wallet
  const token = jwt.sign(
    { voterId, walletAddress, role: "voter" },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "24h" }
  );

  res.json({ token, walletAddress });
});

module.exports = router;
