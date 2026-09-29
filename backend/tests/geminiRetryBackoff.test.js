// Verifies the retry wrappers actually back off on a transient 503 instead
// of retrying immediately — without ever calling the real Gemini API and
// without the test suite really waiting the ~2s backoff (sleep is mocked).
jest.mock("../utils/geminiClient");
jest.mock("../utils/sleep");

const { extractExpenseFromVoice, extractReceiptWithGemini } = require("../utils/geminiClient");
const { sleep } = require("../utils/sleep");
const { extractVoiceWithRetry } = require("../utils/extractVoice");
const { extractReceiptWithRetry } = require("../utils/extractReceipt");
const moment = require("moment");

function make503() {
  const error = new Error("Gemini request failed (503): {\"error\":{\"status\":\"UNAVAILABLE\"}}");
  error.status = 503;
  return error;
}

beforeEach(() => {
  jest.clearAllMocks();
  sleep.mockResolvedValue(undefined);
});

// The retry wrapper validates the raw Gemini JSON with a Zod schema that
// coerces `date` into a real Date, so what the wrapper returns has a Date
// object here even though the mocked Gemini response below is a plain string.
const rawVoiceExtraction = {
  amount: 200,
  date: "2026-09-27",
  note: "Auto fare",
  category: "Sports, Outdoor & Travel",
  confidence: 0.9,
};
const validVoiceExtraction = { ...rawVoiceExtraction, date: new Date("2026-09-27") };

describe("extractVoiceWithRetry backoff on 503", () => {
  it("waits with exponential backoff (not immediately) before the retry, then succeeds", async () => {
    extractExpenseFromVoice
      .mockRejectedValueOnce(make503())
      .mockResolvedValueOnce({ json: rawVoiceExtraction, tokensUsed: 90 });

    const { extracted, lastErrorStatus } = await extractVoiceWithRetry("kal do sau rupaye", moment().format("YYYY-MM-DD"));

    expect(extracted).toEqual(validVoiceExtraction);
    expect(lastErrorStatus).toBeNull(); // succeeded on retry, so no lingering failure status
    expect(extractExpenseFromVoice).toHaveBeenCalledTimes(2);

    // Backed off, and by the ~2s base amount for a 503 — not the old flat 800ms.
    expect(sleep).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(2000);
  });

  it("still respects the existing 2-attempt cap and deterministic null fallback when both attempts 503", async () => {
    extractExpenseFromVoice.mockRejectedValue(make503());

    const { extracted, lastErrorStatus } = await extractVoiceWithRetry("kal do sau rupaye", moment().format("YYYY-MM-DD"));

    expect(extracted).toBeNull();
    expect(lastErrorStatus).toBe(503);
    expect(extractExpenseFromVoice).toHaveBeenCalledTimes(2); // not increased
    expect(sleep).toHaveBeenCalledTimes(1); // only one gap between the two attempts
    expect(sleep).toHaveBeenCalledWith(2000);
  });

  it("does not apply the longer 503 backoff to a non-overload failure (invalid shape)", async () => {
    extractExpenseFromVoice
      .mockResolvedValueOnce({ json: { amount: "not-a-number" }, tokensUsed: 10 })
      .mockResolvedValueOnce({ json: rawVoiceExtraction, tokensUsed: 90 });

    const { extracted } = await extractVoiceWithRetry("kal do sau rupaye", moment().format("YYYY-MM-DD"));

    expect(extracted).toEqual(validVoiceExtraction);
    expect(sleep).toHaveBeenCalledWith(800);
  });
});

describe("extractReceiptWithRetry backoff on 503 (shared wrapper pattern)", () => {
  const rawReceiptExtraction = {
    amount: 42.5,
    date: "2024-03-05",
    merchant: "Corner Cafe",
    category: "Entertainment",
    confidence: 0.92,
  };
  const validReceiptExtraction = { ...rawReceiptExtraction, date: new Date("2024-03-05") };

  it("waits with exponential backoff before the retry, then succeeds", async () => {
    extractReceiptWithGemini
      .mockRejectedValueOnce(make503())
      .mockResolvedValueOnce({ json: rawReceiptExtraction, tokensUsed: 120 });

    const { extracted } = await extractReceiptWithRetry("base64image", "image/jpeg");

    expect(extracted).toEqual(validReceiptExtraction);
    expect(sleep).toHaveBeenCalledWith(2000);
  });
});
