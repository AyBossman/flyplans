const router = require("express").Router();
const prisma = require("../lib/prisma");
const { authenticate, requireRole } = require("../middleware/auth");

// GET /api/listings — Search & filter listings
router.get("/", async (req, res, next) => {
  try {
    const {
      city, country, region, type,
      minPrice, maxPrice,
      minDiscount,
      guests,
      page = 1, limit = 12,
      sortBy = "createdAt", sortOrder = "desc",
    } = req.query;

    const where = { isActive: true };
    if (city)       where.city       = { contains: city, mode: "insensitive" };
    if (country)    where.country    = { contains: country, mode: "insensitive" };
    if (region)     where.region     = { contains: region, mode: "insensitive" };
    if (type)       where.type       = type;
    if (minPrice)   where.pricePerMonth = { ...where.pricePerMonth, gte: parseFloat(minPrice) };
    if (maxPrice)   where.pricePerMonth = { ...where.pricePerMonth, lte: parseFloat(maxPrice) };
    if (minDiscount) where.discountPercent = { gte: parseInt(minDiscount) };
    if (guests)     where.maxGuests  = { gte: parseInt(guests) };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          host: { select: { id: true, name: true, avatar: true, isVerified: true } },
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true, bookings: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    // Attach average rating
    const enriched = listings.map((l) => ({
      ...l,
      avgRating: l.reviews.length
        ? +(l.reviews.reduce((s, r) => s + r.rating, 0) / l.reviews.length).toFixed(1)
        : null,
      reviews: undefined,
    }));

    res.json({ data: enriched, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
});

// GET /api/listings/:id — Single listing
router.get("/:id", async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        host: { select: { id: true, name: true, avatar: true, isVerified: true, bio: true, createdAt: true } },
        reviews: {
          include: { author: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const avgRating = listing.reviews.length
      ? +(listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length).toFixed(1)
      : null;

    res.json({ ...listing, avgRating });
  } catch (err) {
    next(err);
  }
});

// POST /api/listings — Create listing (hosts only)
router.post("/", authenticate, requireRole("HOST", "ADMIN"), async (req, res, next) => {
  try {
    const {
      title, description, type, address, city, country, region,
      latitude, longitude, pricePerNight, pricePerMonth, discountPercent,
      maxGuests, bedrooms, bathrooms, photos, amenities,
    } = req.body;

    const listing = await prisma.listing.create({
      data: {
        hostId: req.user.id,
        title, description, type, address, city, country, region,
        latitude, longitude,
        pricePerNight: parseFloat(pricePerNight),
        pricePerMonth: parseFloat(pricePerMonth),
        discountPercent: parseInt(discountPercent) || 0,
        maxGuests: parseInt(maxGuests) || 1,
        bedrooms: parseInt(bedrooms) || 1,
        bathrooms: parseInt(bathrooms) || 1,
        photos: photos || [],
        amenities: amenities || [],
      },
    });

    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
});

// PUT /api/listings/:id — Update listing
router.put("/:id", authenticate, requireRole("HOST", "ADMIN"), async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.hostId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not your listing" });
    }

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/listings/:id
router.delete("/:id", authenticate, requireRole("HOST", "ADMIN"), async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.hostId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not your listing" });
    }
    // Soft delete — just mark inactive
    await prisma.listing.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: "Listing deactivated" });
  } catch (err) {
    next(err);
  }
});

// GET /api/listings/host/mine — Host's own listings
router.get("/host/mine", authenticate, requireRole("HOST", "ADMIN"), async (req, res, next) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { hostId: req.user.id },
      include: { _count: { select: { bookings: true, reviews: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(listings);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
