const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

// Routes
app.use("/api/auth",      require("./routes/auth"));
app.use("/api/votes",     require("./routes/votes"));

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", chain: "Polygon" }));

// ─── Database Connection ─────────────────────────────────────────
const mongoUri = process.env.MONGODB_URI;
const isValidMongo = mongoUri && (mongoUri.startsWith("mongodb://") || mongoUri.startsWith("mongodb+srv://"));

if (require.main === module) {
  if (isValidMongo) {
    mongoose.connect(mongoUri)
      .then(() => {
        console.log("✅ Connected to MongoDB");
        app.listen(4000, () => console.log("🚀 Backend running on port 4000"));
      })
      .catch(err => console.error("❌ MongoDB connection error:", err));
  } else {
    console.warn("⚠️ MONGODB_URI is invalid or a placeholder. Running without database persistence.");
    app.listen(4000, () => console.log("🚀 Backend running on port 4000 (no DB)"));
  }
}

module.exports = app;
