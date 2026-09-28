const { CATEGORIES } = require("../constants/categories");

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const buildPrompt = () => `You are extracting structured data from a photo of a receipt or bill.
Return the total amount paid, the transaction date (as an ISO 8601 date, e.g. 2024-03-05), the merchant/store name, and the single best-matching category.
The category MUST be exactly one of these strings, copied verbatim: ${CATEGORIES.join(", ")}.
confidence is a number from 0 to 1 for how sure you are about the extraction as a whole — lower it if the photo is blurry, handwritten, or a field is unclear rather than guessing wildly.`;

// Calls Gemini's vision model with the receipt image and asks for JSON that
// matches our schema directly (structured-output mode), so we don't have to
// parse free-form text out of the response.
async function extractReceiptWithGemini(base64Image, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const requestBody = {
    contents: [
      {
        parts: [
          { text: buildPrompt() },
          { inline_data: { mime_type: mimeType, data: base64Image } },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
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
    },
  };

  const response = await fetch(
    `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`,
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

  return JSON.parse(text);
}

module.exports = { extractReceiptWithGemini };
