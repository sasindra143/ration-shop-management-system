// Authentication removed — all routes are publicly accessible.
// protect and adminOnly are kept as no-op middleware for compatibility.

const protect = (req, res, next) => next();

const adminOnly = (req, res, next) => next();

module.exports = { protect, adminOnly };
