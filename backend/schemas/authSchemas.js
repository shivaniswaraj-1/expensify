const { z } = require("zod");
const validator = require("validator");

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required").email("Please use a valid email"),
  password: z.string().refine((val) => validator.isStrongPassword(val), {
    message: "Password is too weak",
  }),
});

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Please use a valid email"),
  password: z.string().min(1, "Password is required"),
});

const resetRequestSchema = z.object({
  email: z.string().trim().min(1, "Please provide an email!").email("Please use a valid email"),
});

const changePasswordSchema = z.object({
  token: z.string().min(1, "Invalid Session!"),
  password: z.string().refine((val) => validator.isStrongPassword(val), {
    message: "Password is not strong enough!",
  }),
});

module.exports = {
  signupSchema,
  loginSchema,
  resetRequestSchema,
  changePasswordSchema,
};
