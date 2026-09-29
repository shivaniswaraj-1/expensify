// How long to wait before the single Gemini retry, based on why the
// previous attempt failed.
//
// A 503 ("This model is currently experiencing high demand...") is a
// transient capacity problem, not something specific to our request, so an
// immediate/near-immediate retry usually lands in the same overload spike.
// Everything else (a malformed/invalid JSON response, a network blip, etc.)
// isn't a capacity issue, so it keeps the original short pause.
//
// Written as base * 2^(attempt-1) so it's a real exponential backoff if the
// retry budget ever grows beyond today's single retry, not just a constant
// dressed up as one.
const BASE_OVERLOAD_RETRY_DELAY_MS = 2000;
const DEFAULT_RETRY_DELAY_MS = 800;

function getRetryDelayMs(error, attempt) {
  if (error?.status === 503) {
    return BASE_OVERLOAD_RETRY_DELAY_MS * 2 ** (attempt - 1);
  }
  return DEFAULT_RETRY_DELAY_MS;
}

module.exports = { getRetryDelayMs };
