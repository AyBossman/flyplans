// ─── messages.js ─────────────────────────────────────────────────────────────
const msgRouter = require("express").Router();
const prisma = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

// GET /api/messages/:bookingId
msgRouter.get("/:bookingId", authenticate, async (req, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where: { bookingId: req.params.bookingId },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "asc" },
    });
    // Mark received messages as read
    await prisma.message.updateMany({
      where: { bookingId: req.params.bookingId, receiverId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

// POST /api/messages
msgRouter.post("/", authenticate, async (req, res, next) => {
  try {
    const { bookingId, receiverId, content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Message cannot be empty" });

    const message = await prisma.message.create({
      data: { senderId: req.user.id, receiverId, bookingId, content: content.trim() },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });

    // Notify receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: `New message from ${req.user.name}`,
        body: content.substring(0, 80),
        type: "message",
        link: `/messages/${bookingId}`,
      },
    });

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

module.exports = msgRouter;
