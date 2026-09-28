const router = require("express").Router();
const { askSpending } = require("../controllers/spendingQueryController");
const { getMonthlyInsights } = require("../controllers/insightsController");
const { getAiStats } = require("../controllers/aiAdminController");
const protected = require("../middleware/auth");
const validate = require("../middleware/validate");
const { aiLimiter } = require("../middleware/rateLimiter");
const { askSpendingRequestSchema } = require("../schemas/spendingQuerySchema");

router.use(protected);

router.route("/ask").post(aiLimiter, validate(askSpendingRequestSchema), askSpending);
router.route("/insights").get(aiLimiter, getMonthlyInsights);
router.route("/admin/stats").get(getAiStats);

module.exports = router;
