const router = require("express").Router();
const {
  createOrder,
  verifyOrder,
  leaderboard,
  getReport,
  downloadExpenses,
  getUserDownloads,
} = require("../controllers/premiumController");
const protected = require("../middleware/auth");
const verifyPremium = require("../middleware/premium");

router.use(protected);

// Razorpay / premium-only routes (kept for future use)
router.route("/create-order").get(verifyPremium, createOrder);
router.route("/verify-order").post(verifyPremium, verifyOrder);
router.route("/leaderboard").get(verifyPremium, leaderboard);

// ✅ FIX 1: Report is now open to ALL users (verifyPremium removed)
router.route("/report").get(getReport);

// Download routes (premium-only, kept for future use)
router.route("/report/download").post(verifyPremium, downloadExpenses);
router.route("/report/download-history").get(verifyPremium, getUserDownloads);

module.exports = router;
