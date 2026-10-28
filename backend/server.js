
const dns = require("node:dns");

// DNS configuration for MongoDB Atlas SRV lookups.
// Keep this before importing Mongoose.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

// Allow local development and the deployed Vercel frontend.
// CLIENT_ORIGIN can contain additional comma-separated origins.
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "https://expense-tracker-one-umber-79.vercel.app",
];

const environmentOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = [
  ...new Set([...defaultAllowedOrigins, ...environmentOrigins]),
];

const corsOptions = {
  origin(origin, callback) {
    // Allow requests without an Origin header, such as server-to-server calls.
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

// CORS middleware must be registered before API routes.
app.use(cors(corsOptions));

app.use(express.json({ limit: "20kb" }));

// API home
app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API is running" });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// Transaction routes
app.use("/api/transactions", transactionRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI. Configure it in Render Environment Variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("Connected to MongoDB Atlas");
    console.log("Allowed frontend origins:", allowedOrigins);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Expense Tracker API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Could not connect to MongoDB Atlas:",
      error.message
    );
    process.exit(1);
  }
}

startServer();
