// Used to add a brief pause before a Gemini retry, so a transient "high
// demand" 503 has a chance to clear instead of the retry landing in the
// same overload spike as the first attempt.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { sleep };
