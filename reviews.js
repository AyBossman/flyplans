// ─── reviews.js ──────────────────────────────────────────────────────────────
const reviewRouter = require("express").Router();
const prisma = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

// POST /api/reviews — Leave review after completed booking
reviewRouter.post("/", authenticate, async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be 1–5" });

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.travelerId !== req.user.id) return res.status(403).json({ error: "Not your booking" });
    if (booking.status !== "COMPLETED") return res.status(400).json({ error: "Booking must be completed first" });

    const existing = await prisma.review.findUnique({ where: { bookingId } });
    if (existing) return res.status(409).json({ error: "Review already submitted" });

    const review = await prisma.review.create({
      data: {
        authorId: req.user.id,
        targetId: booking.listing.hostId,
        listingId: booking.listingId,
        bookingId,
        rating: parseInt(rating),
        comment,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

// GET /api/reviews/listing/:listingId
reviewRouter.get("/listing/:listingId", async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { listingId: req.params.listingId },
      include: { author: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });
    const avg = reviews.length ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
    res.json({ reviews, avgRating: avg, total: reviews.length });
  } catch (err) {
    next(err);
  }
});

module.exports = reviewRouter;
