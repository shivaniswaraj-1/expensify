const rateLimit = require("express-rate-limit");

// Applied to every request. Generous enough for normal dashboard use, but
// caps abuse of endpoints that will soon call paid AI APIs.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

// Tighter cap on auth endpoints (login/signup/reset) to slow down
// credential-stuffing and brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later." },
});

module.exports = { apiLimiter, authLimiter };
