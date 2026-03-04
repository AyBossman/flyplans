const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Prisma errors
  if (err.code === "P2002") {
    return res.status(409).json({ error: "A record with that value already exists." });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found." });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token." });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
};

module.exports = { errorHandler };
