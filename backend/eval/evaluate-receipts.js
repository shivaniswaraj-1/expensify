// Measures how accurately the current Gemini prompt (backend/utils/geminiClient.js)
// extracts amount + date from real receipts, so prompt changes can be judged
// against a real score instead of a hunch.
//
// Usage:
//   1. Put ~30 real receipt photos in backend/eval/receipts/
//   2. Fill in backend/eval/expected.json with the correct amount/date for each
//   3. From backend/, run: node eval/evaluate-receipts.js
//
// Uses the exact same extraction + retry code path as the live
// /api/receipts/scan route, so the score reflects real app behavior.

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { extractReceiptWithRetry } = require("../utils/extractReceipt");

const RECEIPTS_DIR = path.join(__dirname, "receipts");
const EXPECTED_PATH = path.join(__dirname, "expected.json");

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

// A few cents of rounding slack is fine; anything more is a real miss.
const AMOUNT_TOLERANCE = 0.01;

function loadExpected() {
  const expected = JSON.parse(fs.readFileSync(EXPECTED_PATH, "utf-8"));
  delete expected._comment;
  return expected;
}

async function evaluateOne(filename, expected) {
  const filePath = path.join(RECEIPTS_DIR, filename);
  const ext = path.extname(filename).toLowerCase();
  const mimeType = MIME_TYPES[ext];

  if (!fs.existsSync(filePath)) {
    return { filename, error: "file not found in eval/receipts/" };
  }
  if (!mimeType) {
    return { filename, error: `unsupported extension ${ext}` };
  }

  const base64Image = fs.readFileSync(filePath).toString("base64");
  const extracted = await extractReceiptWithRetry(base64Image, mimeType);

  if (!extracted) {
    return { filename, error: "extraction failed (both attempts)" };
  }

  const amountCorrect = Math.abs(extracted.amount - expected.amount) <= AMOUNT_TOLERANCE;
  const extractedDate = extracted.date.toISOString().slice(0, 10);
  const dateCorrect = extractedDate === expected.date;

  return { filename, extracted: { ...extracted, date: extractedDate }, amountCorrect, dateCorrect };
}

async function main() {
  const expected = loadExpected();
  const filenames = Object.keys(expected);

  if (filenames.length === 0) {
    console.log("No entries in eval/expected.json — add some receipts and their correct values first.");
    return;
  }

  let amountHits = 0;
  let dateHits = 0;
  let evaluated = 0;

  for (const filename of filenames) {
    const result = await evaluateOne(filename, expected[filename]);

    if (result.error) {
      console.log(`✗ ${filename}: ${result.error}`);
      continue;
    }

    evaluated++;
    if (result.amountCorrect) amountHits++;
    if (result.dateCorrect) dateHits++;

    const amountMark = result.amountCorrect ? "✓" : "✗";
    const dateMark = result.dateCorrect ? "✓" : "✗";
    console.log(
      `${amountMark}${dateMark} ${filename} — got amount=${result.extracted.amount}, date=${result.extracted.date} ` +
        `(expected amount=${expected[filename].amount}, date=${expected[filename].date})`
    );
  }

  console.log("\n──────────────────────────");
  console.log(`Amount accuracy: ${amountHits}/${filenames.length}`);
  console.log(`Date accuracy:   ${dateHits}/${filenames.length}`);
  console.log(`Extracted at all: ${evaluated}/${filenames.length}`);
}

main().catch((error) => {
  console.error("Evaluation run failed:", error);
  process.exit(1);
});
