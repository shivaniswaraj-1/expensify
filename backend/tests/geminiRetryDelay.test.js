const { getRetryDelayMs } = require("../utils/geminiRetryDelay");

describe("getRetryDelayMs", () => {
  it("uses a ~2s base delay for a transient 503 (high demand) on the first retry", () => {
    const error = new Error("Gemini request failed (503): overloaded");
    error.status = 503;
    expect(getRetryDelayMs(error, 1)).toBe(2000);
  });

  it("doubles the 503 delay for each subsequent attempt (exponential, not constant)", () => {
    const error = new Error("Gemini request failed (503): overloaded");
    error.status = 503;
    expect(getRetryDelayMs(error, 2)).toBe(4000);
    expect(getRetryDelayMs(error, 3)).toBe(8000);
  });

  it("keeps the original short delay for a non-503 failure (e.g. a malformed response)", () => {
    const error = new Error("invalid shape");
    expect(getRetryDelayMs(error, 1)).toBe(800);
  });

  it("keeps the short delay for other HTTP failures like 429 or 500", () => {
    const rateLimited = new Error("Gemini request failed (429): quota exceeded");
    rateLimited.status = 429;
    expect(getRetryDelayMs(rateLimited, 1)).toBe(800);

    const serverError = new Error("Gemini request failed (500): internal error");
    serverError.status = 500;
    expect(getRetryDelayMs(serverError, 1)).toBe(800);
  });

  it("keeps the short delay when the error has no status at all", () => {
    expect(getRetryDelayMs(new Error("network blip"), 1)).toBe(800);
    expect(getRetryDelayMs(undefined, 1)).toBe(800);
  });
});
