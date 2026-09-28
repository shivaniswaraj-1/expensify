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
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const {
  signupSchema,
  loginSchema,
  resetRequestSchema,
  changePasswordSchema,
} = require("../schemas/authSchemas");

router.route("/signup").post(authLimiter, validate(signupSchema), createUser);
router.route("/login").post(authLimiter, validate(loginSchema), login);
router.route("/refresh").get(protected, refreshToken);
router.route("/token").post(authLimiter, validate(resetRequestSchema), resetPassword);
router.route("/reset-password").get(validateToken);

router.route("/reset-password").post(authLimiter, validate(changePasswordSchema), changePassword);

module.exports = router;
