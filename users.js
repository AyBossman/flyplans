// ─── users.js ─────────────────────────────────────────────────────────────────
const userRouter = require("express").Router();
const prisma = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

// GET /api/users/profile — Get own profile
userRouter.get("/profile", authenticate, async (req, res) => {
  const { passwordHash, ...safe } = req.user;
  res.json(safe);
});

// PUT /api/users/profile — Update own profile
userRouter.put("/profile", authenticate, async (req, res, next) => {
  try {
    const { name, bio, phone, avatar } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, bio, phone, avatar },
      select: { id: true, name: true, email: true, bio: true, phone: true, avatar: true, role: true },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

// GET /api/users/wishlist
userRouter.get("/wishlist", authenticate, async (req, res, next) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: { listing: { include: { host: { select: { name: true, isVerified: true } }, reviews: { select: { rating: true } } } } },
    });
    res.json(wishlist);
  } catch (err) { next(err); }
});

// POST /api/users/wishlist/:listingId
userRouter.post("/wishlist/:listingId", authenticate, async (req, res, next) => {
  try {
    const item = await prisma.wishlist.upsert({
      where: { userId_listingId: { userId: req.user.id, listingId: req.params.listingId } },
      update: {},
      create: { userId: req.user.id, listingId: req.params.listingId },
    });
    res.status(201).json(item);
  } catch (err) { next(err); }
});

// DELETE /api/users/wishlist/:listingId
userRouter.delete("/wishlist/:listingId", authenticate, async (req, res, next) => {
  try {
    await prisma.wishlist.delete({
      where: { userId_listingId: { userId: req.user.id, listingId: req.params.listingId } },
    });
    res.json({ message: "Removed from wishlist" });
  } catch (err) { next(err); }
});

// GET /api/users/notifications
userRouter.get("/notifications", authenticate, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    res.json(notifications);
  } catch (err) { next(err); }
});

// POST /api/users/verify-host — Submit host verification docs
userRouter.post("/verify-host", authenticate, async (req, res, next) => {
  try {
    const { documentUrl, videoUrl } = req.body;
    const verification = await prisma.hostVerification.upsert({
      where: { userId: req.user.id },
      update: { documentUrl, videoUrl, status: "PENDING" },
      create: { userId: req.user.id, documentUrl, videoUrl },
    });
    res.status(201).json(verification);
  } catch (err) { next(err); }
});

module.exports = userRouter;
