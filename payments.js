// ─── payments.js ─────────────────────────────────────────────────────────────
const payRouter = require("express").Router();
const prisma = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/create-checkout-session
payRouter.post("/create-checkout-session", authenticate, async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true, traveler: true },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.travelerId !== req.user.id) return res.status(403).json({ error: "Not your booking" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: booking.listing.title,
            description: `${booking.totalNights} nights in ${booking.listing.city}`,
          },
          unit_amount: Math.round(booking.totalPrice * 100), // cents
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/booking/${bookingId}?success=true`,
      cancel_url:  `${process.env.FRONTEND_URL}/booking/${bookingId}?cancelled=true`,
      customer_email: req.user.email,
      metadata: { bookingId },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { stripeSessionId: session.id },
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/webhook — Stripe webhook
payRouter.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { bookingId } = session.metadata;
    await prisma.booking.update({
      where: { id: bookingId },
      data: { stripePaymentId: session.payment_intent, status: "CONFIRMED" },
    });
  }

  res.json({ received: true });
});

module.exports = payRouter;
