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

// Connect DB & start
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
      app.listen(4000, () => console.log("🚀 Backend running on port 4000"));
    })
    .catch(console.error);
} else {
  console.warn("MONGODB_URI not found. Starting server without MongoDB...");
  app.listen(4000, () => console.log("🚀 Backend running on port 4000 (no DB)"));
}

module.exports = app;
