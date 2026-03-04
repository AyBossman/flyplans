// FlyPlans — Express Server Entry Point
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const listingRoutes = require("./routes/listings");
const bookingRoutes = require("./routes/bookings");
const reviewRoutes = require("./routes/reviews");
const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/users");
const paymentRoutes = require("./routes/payments");
const budgetRoutes = require("./routes/budget");
const adminRoutes = require("./routes/admin");

const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security & Logging ───────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan("dev"));
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: "Too many requests" });
app.use("/api/", limiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
// Stripe webhook needs raw body BEFORE json parser
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews",  reviewRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/budget",   budgetRoutes);
app.use("/api/admin",    adminRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => console.log(`🚀 FlyPlans API running on http://localhost:${PORT}`));

module.exports = app;
