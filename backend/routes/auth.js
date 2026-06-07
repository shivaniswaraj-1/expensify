const router = require("express").Router();
const {
  createUser,
  login,
  resetPassword,
  validateToken,
  changePassword,
  refreshToken,
} = require("../controllers/authController");
const protected = require("../middleware/auth");

router.route("/signup").post(createUser);
router.route("/login").post(login);
router.route("/refresh").get(protected, refreshToken);
router.route("/token").post(resetPassword);
router.route("/reset-password").get(validateToken);

// ✅ FIX 2: Added POST /reset-password to match frontend (was PUT /:token only)
router.route("/reset-password").post(changePassword);
router.route("/reset-password/:token").put(changePassword); // kept for backward compat

module.exports = router;
