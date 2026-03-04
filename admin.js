// ─── admin.js ─────────────────────────────────────────────────────────────────
const adminRouter = require("express").Router();
const prisma = require("../lib/prisma");
const { authenticate, requireRole } = require("../middleware/auth");

// All admin routes require ADMIN role
adminRouter.use(authenticate, requireRole("ADMIN"));

// GET /api/admin/stats — Dashboard stats
adminRouter.get("/stats", async (req, res, next) => {
  try {
    const [users, listings, bookings, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { isActive: true } }),
      prisma.booking.count(),
      prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { status: "COMPLETED" } }),
    ]);
    res.json({ users, listings, bookings, revenue: revenue._sum.totalPrice || 0 });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/verifications — Pending host verifications
adminRouter.get("/verifications", async (req, res, next) => {
  try {
    const pending = await prisma.hostVerification.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json(pending);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/verifications/:id — Approve or reject
adminRouter.put("/verifications/:id", async (req, res, next) => {
  try {
    const { status, notes } = req.body; // APPROVED or REJECTED
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Status must be APPROVED or REJECTED" });
    }

    const verification = await prisma.hostVerification.update({
      where: { id: req.params.id },
      data: { status, notes, reviewedAt: new Date() },
      include: { user: true },
    });

    // If approved, mark user as verified + update role to HOST
    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: verification.userId },
        data: { isVerified: true, role: "HOST" },
      });
    }

    await prisma.notification.create({
      data: {
        userId: verification.userId,
        title: status === "APPROVED" ? "Host Verification Approved! 🎉" : "Verification Update",
        body: status === "APPROVED"
          ? "Congratulations! Your host verification has been approved. You can now list your property."
          : `Your verification was not approved. ${notes || "Please resubmit with clearer documents."}`,
        type: "verification",
      },
    });

    res.json(verification);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users — List all users
adminRouter.get("/users", async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true,
        _count: { select: { listings: true, bookings: true } } },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/listings/:id — Hard delete listing
adminRouter.delete("/listings/:id", async (req, res, next) => {
  try {
    await prisma.listing.delete({ where: { id: req.params.id } });
    res.json({ message: "Listing deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = adminRouter;
