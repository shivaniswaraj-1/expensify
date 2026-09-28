const { z } = require("zod");
const { CATEGORIES } = require("../constants/categories");

const expenseSchema = z.object({
  amount: z.coerce
    .number({ error: "Amount must be a number" })
    .positive("Amount must be greater than 0"),
  category: z.enum(CATEGORIES, {
    error: "Category must be one of the supported categories",
  }),
  description: z.string().trim().min(1, "Description is required"),
  // Optional metadata that comes from the receipt-scanning flow — a
  // manually-added expense simply omits these.
  date: z.coerce.date().optional(),
  merchant: z.string().trim().optional(),
  receiptUrl: z.url().optional(),
  receiptConfidence: z.coerce.number().min(0).max(1).optional(),
});

module.exports = { addExpenseSchema: expenseSchema, updateExpenseSchema: expenseSchema };
