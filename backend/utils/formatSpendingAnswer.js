const moment = require("moment");

// Turns { category?, from?, to?, metric } + the aggregation result into a
// one-line answer. Formatted from our own numbers rather than asked of the
// LLM again — the amount always comes straight from the database.
function formatDateRangePhrase(from, to) {
  if (!from && !to) return "overall";

  if (from && to) {
    const fromM = moment(from);
    const toM = moment(to);
    const looksLikeFullMonth =
      fromM.date() === 1 && toM.isSame(fromM.clone().endOf("month"), "day") && fromM.isSame(toM, "month");
    if (looksLikeFullMonth) return `in ${fromM.format("MMMM YYYY")}`;
    return `from ${fromM.format("D MMM YYYY")} to ${toM.format("D MMM YYYY")}`;
  }

  if (from) return `since ${moment(from).format("D MMM YYYY")}`;
  return `up to ${moment(to).format("D MMM YYYY")}`;
}

function formatSpendingAnswer(filter, value) {
  const categoryPhrase = filter.category ? `on ${filter.category}` : "overall";
  const rangePhrase = formatDateRangePhrase(filter.from, filter.to);

  if (filter.metric === "count") {
    const count = Math.round(value);
    return `You made ${count} transaction${count === 1 ? "" : "s"} ${categoryPhrase} ${rangePhrase}.`;
  }

  if (filter.metric === "average") {
    return `Your average spend ${categoryPhrase} ${rangePhrase} was ₹${Math.round(value).toLocaleString("en-IN")}.`;
  }

  return `You spent ₹${Math.round(value).toLocaleString("en-IN")} ${categoryPhrase} ${rangePhrase}.`;
}

module.exports = { formatSpendingAnswer };
