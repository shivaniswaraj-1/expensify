const { z } = require("zod");

const verifyOrderSchema = z.object({
  razorpay_order_id: z.string().min(1, "All fields are Mandatory!"),
  razorpay_payment_id: z.string().min(1, "All fields are Mandatory!"),
  razorpay_signature: z.string().min(1, "All fields are Mandatory!"),
});

const reportQuerySchema = z.object({
  type: z.enum(["weekly", "monthly", "yearly"], {
    error: "Invalid Type Specified!",
  }),
});

module.exports = { verifyOrderSchema, reportQuerySchema };
