const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      allowNull: false,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // When the purchase actually happened (from a scanned receipt, or "now"
    // for a manually-entered expense) — separate from createdAt/updatedAt,
    // which track when the record itself was written.
    date: {
      type: Date,
      default: Date.now,
    },
    merchant: {
      type: String,
    },
    receiptUrl: {
      type: String,
    },
    receiptConfidence: {
      type: Number,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = Expense;
