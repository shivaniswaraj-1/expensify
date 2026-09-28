const { z } = require("zod");

// What we require from Gemini before showing its insights to the user.
const insightsResponseSchema = z.object({
  insights: z.array(z.string().trim().min(1)).length(3),
});

module.exports = { insightsResponseSchema };
