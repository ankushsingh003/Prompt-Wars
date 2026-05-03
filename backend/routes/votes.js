const express = require("express");
const router  = express.Router();
const bc      = require("../services/blockchainService");
const rateLimit = require("express-rate-limit");

const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: "Too many vote attempts"
});

// POST /api/votes/cast — submit vote (relay mode, backend pays gas)
router.post("/cast", voteLimiter, async (req, res) => {
  try {
    const { electionId, candidateId, voterAddress, signature } = req.body;

    if (!electionId || !candidateId || !voterAddress || !signature) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if already voted (fast read)
    const voted = await bc.hasVoted(electionId, voterAddress);
    if (voted) return res.status(409).json({ error: "Already voted" });

    // Relay vote to blockchain
    const txHash = await bc.relayVote(electionId, candidateId, voterAddress, signature);

    res.json({ success: true, txHash, polygonscan: `https://mumbai.polygonscan.com/tx/${txHash}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/votes/results/:electionId — live results
router.get("/results/:electionId", async (req, res) => {
  try {
    const results = await bc.getResults(req.params.electionId);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
