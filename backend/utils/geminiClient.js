const { CATEGORIES } = require("../constants/categories");

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// Shared low-level caller for every Gemini text/JSON request in the app
// (receipt scanning, voice parsing, spending questions, monthly insights).
// Centralizing it here means every feature gets the same structured-output
// handling and the same token-usage number for free, which the callers use
// for cost/speed logging (see utils/aiLogger.js).
async function callGemini({ contents, responseSchema, model }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  const chosenModel = model || process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const requestBody = {
    contents,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
    },
  };

  const response = await fetch(
    `${GEMINI_API_BASE}/${chosenModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned no extractable content");
  }

  return {
    json: JSON.parse(text),
    tokensUsed: data?.usageMetadata?.totalTokenCount ?? null,
  };
}

const buildReceiptPrompt = () => `You are extracting structured data from a photo of a receipt or bill.
Return the total amount paid, the transaction date (as an ISO 8601 date, e.g. 2024-03-05), the merchant/store name, and the single best-matching category.
The category MUST be exactly one of these strings, copied verbatim: ${CATEGORIES.join(", ")}.
confidence is a number from 0 to 1 for how sure you are about the extraction as a whole — lower it if the photo is blurry, handwritten, or a field is unclear rather than guessing wildly.`;

// Calls Gemini's vision model with the receipt image and asks for JSON that
// matches our schema directly (structured-output mode), so we don't have to
// parse free-form text out of the response.
async function extractReceiptWithGemini(base64Image, mimeType) {
  return callGemini({
    contents: [
      {
        parts: [
          { text: buildReceiptPrompt() },
          { inline_data: { mime_type: mimeType, data: base64Image } },
        ],
      },
    ],
    responseSchema: {
      type: "OBJECT",
      properties: {
        amount: { type: "NUMBER" },
        date: { type: "STRING" },
        merchant: { type: "STRING" },
        category: { type: "STRING", enum: CATEGORIES },
        confidence: { type: "NUMBER" },
      },
      required: ["amount", "date", "merchant", "category", "confidence"],
    },
  });
}

const buildVoicePrompt = (todayIso) => `You are extracting a structured expense from a spoken transcript. The speaker may talk in Hindi, English, or Hinglish (a mix of both), so understand Devanagari, romanized Hindi, and English number words/phrases interchangeably (e.g. "do sau rupaye" = 200 rupees, "paanch sau" = 500).
Today's date is ${todayIso} (ISO 8601). Resolve relative dates spoken by the user — "aaj"/"today", "kal" (yesterday, unless context implies tomorrow), "parso", "last Sunday", "pichle hafte" — into an absolute ISO 8601 date relative to today. If no date is mentioned, use today's date.
Return the amount spent, the resolved date, a short note describing what the expense was for (in English, a few words), and the single best-matching category.
The category MUST be exactly one of these strings, copied verbatim: ${CATEGORIES.join(", ")}.
confidence is a number from 0 to 1 for how sure you are about the extraction as a whole — lower it if the transcript is garbled, ambiguous, or missing key details rather than guessing wildly.`;

// Calls Gemini with a speech-to-text transcript (Hindi/English/Hinglish) and
// asks for the same structured JSON shape as receipt scanning, so both flows
// can share a confirm screen on the frontend.
async function extractExpenseFromVoice(transcript, todayIso) {
  return callGemini({
    contents: [
      {
        parts: [
          { text: buildVoicePrompt(todayIso) },
          { text: `Transcript: "${transcript}"` },
        ],
      },
    ],
    responseSchema: {
      type: "OBJECT",
      properties: {
        amount: { type: "NUMBER" },
        date: { type: "STRING" },
        note: { type: "STRING" },
        category: { type: "STRING", enum: CATEGORIES },
        confidence: { type: "NUMBER" },
      },
      required: ["amount", "date", "note", "category", "confidence"],
    },
  });
}

const buildSpendingQuestionPrompt = (todayIso) => `Convert the user's spending question into a small filter object for a MongoDB aggregation. Do not write any query code — only return the filter fields below.
Today's date is ${todayIso} (ISO 8601).
Fields:
- category: include ONLY if the question names a specific category, copied verbatim from this exact list, otherwise omit the field entirely: ${CATEGORIES.join(", ")}
- from: an ISO 8601 date, the start of the period the question refers to (e.g. "last month", "this week", "in August"). Omit if the question has no date/period.
- to: an ISO 8601 date, the end of that period. Omit if the question has no date/period.
- metric: "sum" if asking how much was spent (default), "count" if asking how many transactions/times, "average" if asking about average/typical spend.`;

// Turns a natural-language spending question into a validated filter object
// — the backend runs the actual MongoDB aggregation from this filter, so the
// AI never touches the database directly and can't see other users' data.
async function parseSpendingQuestion(question, todayIso) {
  return callGemini({
    contents: [
      {
        parts: [
          { text: buildSpendingQuestionPrompt(todayIso) },
          { text: `Question: "${question}"` },
        ],
      },
    ],
    responseSchema: {
      type: "OBJECT",
      properties: {
        category: { type: "STRING", enum: CATEGORIES },
        from: { type: "STRING" },
        to: { type: "STRING" },
        metric: { type: "STRING", enum: ["sum", "count", "average"] },
      },
    },
  });
}

const buildInsightsPrompt = () => `You are a personal finance assistant. Based on the spending summary below (already computed from the user's real data, currency INR), write exactly 3 short insights — one sentence each, at most ~20 words, specific and grounded only in the numbers given. Do not invent numbers or categories that aren't present.`;

// Only ever sees pre-computed totals, never raw expense rows — the backend
// does the math, the LLM just turns numbers into short readable sentences.
async function generateSpendingInsights(stats) {
  return callGemini({
    contents: [
      {
        parts: [
          { text: buildInsightsPrompt() },
          { text: `Spending summary: ${JSON.stringify(stats)}` },
        ],
      },
    ],
    responseSchema: {
      type: "OBJECT",
      properties: {
        insights: {
          type: "ARRAY",
          items: { type: "STRING" },
          minItems: 3,
          maxItems: 3,
        },
      },
      required: ["insights"],
    },
  });
}

module.exports = {
  extractReceiptWithGemini,
  extractExpenseFromVoice,
  parseSpendingQuestion,
  generateSpendingInsights,
};
