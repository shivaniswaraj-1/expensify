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
});

module.exports = { addExpenseSchema: expenseSchema, updateExpenseSchema: expenseSchema };
