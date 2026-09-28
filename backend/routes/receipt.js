const router = require("express").Router();
const { scanReceipt } = require("../controllers/receiptController");
const protected = require("../middleware/auth");
const uploadReceiptImage = require("../middleware/upload");
const { aiLimiter } = require("../middleware/rateLimiter");

router.use(protected);

router.route("/scan").post(aiLimiter, uploadReceiptImage, scanReceipt);

module.exports = router;
