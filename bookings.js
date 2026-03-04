const router = require("express").Router();
const prisma = require("../lib/prisma");
const { authenticate, requireRole } = require("../middleware/auth");

// Calculate total price with discount logic
function calcPrice(pricePerNight, pricePerMonth, discountPercent, nights) {
  if (nights >= 30) {
    const months = nights / 30;
    const raw = pricePerMonth * months;
    return { total: +(raw * (1 - discountPercent / 100)).toFixed(2), discountApplied: discountPercent };
  }
  return { total: +(pricePerNight * nights).toFixed(2), discountApplied: 0 };
}

// POST /api/bookings — Create booking request
router.post("/", authenticate, requireRole("TRAVELER", "ADMIN"), async (req, res, next) => {
  try {
    const { listingId, checkIn, checkOut, guests, specialRequests } = req.body;

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || !listing.isActive) return res.status(404).json({ error: "Listing not available" });

    const checkInDate  = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    if (nights < 1) return res.status(400).json({ error: "Invalid dates" });

    // Check for conflicting bookings
    const conflict = await prisma.booking.findFirst({
      where: {
        listingId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          { checkIn: { lte: checkOutDate }, checkOut: { gte: checkInDate } },
        ],
      },
    });
    if (conflict) return res.status(409).json({ error: "Listing not available for those dates" });

    const { total, discountApplied } = calcPrice(
      listing.pricePerNight, listing.pricePerMonth, listing.discountPercent, nights
    );

    const booking = await prisma.booking.create({
      data: {
        travelerId: req.user.id,
        listingId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: parseInt(guests) || 1,
        totalNights: nights,
        pricePerNight: listing.pricePerNight,
        discountApplied,
        totalPrice: total,
        specialRequests,
      },
      include: {
        listing: { include: { host: { select: { id: true, name: true, email: true } } } },
        traveler: { select: { id: true, name: true, email: true } },
      },
    });

    // Create notification for host
    await prisma.notification.create({
      data: {
        userId: listing.hostId,
        title: "New Booking Request",
        body: `${booking.traveler.name} wants to book "${listing.title}" for ${nights} nights.`,
        type: "booking",
        link: `/dashboard/host/bookings/${booking.id}`,
      },
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/traveler — Traveler's bookings
router.get("/traveler", authenticate, async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = { travelerId: req.user.id };
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        listing: { select: { id: true, title: true, city: true, country: true, photos: true, host: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/host — Host's incoming bookings
router.get("/host", authenticate, requireRole("HOST", "ADMIN"), async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = { listing: { hostId: req.user.id } };
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        listing: { select: { id: true, title: true, photos: true } },
        traveler: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/:id — Single booking
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        listing: { include: { host: { select: { id: true, name: true, avatar: true } } } },
        traveler: { select: { id: true, name: true, avatar: true } },
        messages: { include: { sender: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: "asc" } },
      },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const isOwner = booking.travelerId === req.user.id || booking.listing.hostId === req.user.id;
    if (!isOwner && req.user.role !== "ADMIN") return res.status(403).json({ error: "Access denied" });

    res.json(booking);
  } catch (err) {
    next(err);
  }
});

// PUT /api/bookings/:id/status — Host accepts/declines, traveler cancels
router.put("/:id/status", authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { listing: true, traveler: { select: { id: true, name: true } } },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const isHost     = booking.listing.hostId === req.user.id;
    const isTraveler = booking.travelerId === req.user.id;

    // Host can CONFIRM or CANCEL; traveler can CANCEL
    if (status === "CONFIRMED" && !isHost) return res.status(403).json({ error: "Only host can confirm" });
    if (status === "CANCELLED" && !isHost && !isTraveler) return res.status(403).json({ error: "Not allowed" });
    if (status === "COMPLETED" && !isHost) return res.status(403).json({ error: "Only host can mark complete" });

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
    });

    // Notify the other party
    const notifyUserId = isHost ? booking.travelerId : booking.listing.hostId;
    const messages = {
      CONFIRMED: `Your booking for "${booking.listing.title}" has been confirmed! ✅`,
      CANCELLED: `Booking for "${booking.listing.title}" was cancelled.`,
      COMPLETED: `Your stay at "${booking.listing.title}" is now complete. Please leave a review!`,
    };

    if (messages[status]) {
      await prisma.notification.create({
        data: { userId: notifyUserId, title: `Booking ${status}`, body: messages[status], type: "booking" },
      });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
