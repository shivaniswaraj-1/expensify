const asyncHandler = require("express-async-handler");
const moment = require("moment");
const { extractVoiceWithRetry } = require("../utils/extractVoice");
const { logAiCall } = require("../utils/aiLogger");
const { friendlyAiFailureMessage } = require("../utils/aiErrorMessage");

const parseVoice = asyncHandler(async (req, res, next) => {
  const { transcript } = req.body;
  const todayIso = moment().format("YYYY-MM-DD");

  const startedAt = Date.now();
  const { extracted, tokensUsed, lastErrorStatus } = await extractVoiceWithRetry(transcript, todayIso);
  logAiCall({
    feature: "voice_parse",
    userId: req.user._id,
    tokensUsed,
    responseTimeMs: Date.now() - startedAt,
    success: !!extracted,
  });

  if (!extracted) {
    return res.status(200).json({
      success: false,
      message: friendlyAiFailureMessage(lastErrorStatus, "Couldn't understand that, please fill it in."),
    });
  }

  res.status(200).json({
    success: true,
    extracted,
  });
});

module.exports = { parseVoice };
