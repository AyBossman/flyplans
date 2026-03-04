// ─── budget.js ────────────────────────────────────────────────────────────────
const budgetRouter = require("express").Router();
const prisma = require("../lib/prisma");

// GET /api/budget?city=Lagos&months=3
budgetRouter.get("/", async (req, res, next) => {
  try {
    const { city, months = 1 } = req.query;
    const m = parseFloat(months);

    if (!city) return res.status(400).json({ error: "city is required" });

    const estimate = await prisma.budgetEstimate.findFirst({
      where: { city: { contains: city, mode: "insensitive" } },
    });

    if (!estimate) return res.status(404).json({ error: `No budget data for ${city}` });

    const monthlyTotal = estimate.accommodation + estimate.food + estimate.transport + estimate.activities + estimate.utilities;
    const grandTotal   = +(monthlyTotal * m).toFixed(2);
    const hotelComparison = +(monthlyTotal * 2.5 * m).toFixed(2);

    res.json({
      city: estimate.city,
      country: estimate.country,
      months: m,
      breakdown: {
        accommodation: +(estimate.accommodation * m).toFixed(2),
        food:          +(estimate.food * m).toFixed(2),
        transport:     +(estimate.transport * m).toFixed(2),
        activities:    +(estimate.activities * m).toFixed(2),
        utilities:     +(estimate.utilities * m).toFixed(2),
      },
      monthlyTotal,
      grandTotal,
      hotelComparison,
      savings: +(hotelComparison - grandTotal).toFixed(2),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/budget/cities — List all cities with budget data
budgetRouter.get("/cities", async (req, res, next) => {
  try {
    const cities = await prisma.budgetEstimate.findMany({
      select: { city: true, country: true, region: true, accommodation: true },
      orderBy: { city: "asc" },
    });
    res.json(cities);
  } catch (err) {
    next(err);
  }
});

module.exports = budgetRouter;
