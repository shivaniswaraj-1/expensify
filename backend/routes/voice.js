const router = require("express").Router();
const { parseVoice } = require("../controllers/voiceController");
const protected = require("../middleware/auth");
const validate = require("../middleware/validate");
const { aiLimiter } = require("../middleware/rateLimiter");
const { voiceParseRequestSchema } = require("../schemas/voiceSchema");

router.use(protected);

router.route("/parse").post(aiLimiter, validate(voiceParseRequestSchema), parseVoice);

module.exports = router;
