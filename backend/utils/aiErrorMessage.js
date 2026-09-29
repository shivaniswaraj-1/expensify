// A quota/rate-limit (429) or overload (503) failure isn't the same as the
// AI genuinely failing to understand the input — telling the user "please
// fill it in" / "please rephrase" in that case wrongly implies their input
// was the problem, when it's actually a temporary capacity issue on
// Gemini's side.
function friendlyAiFailureMessage(lastErrorStatus, fallbackMessage) {
  if (lastErrorStatus === 429) {
    return "The AI assistant has hit its usage limit for now. Please try again in a minute.";
  }
  if (lastErrorStatus === 503) {
    return "The AI assistant is temporarily overloaded. Please try again in a moment.";
  }
  return fallbackMessage;
}

module.exports = { friendlyAiFailureMessage };
