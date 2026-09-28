const { ZodError } = require("zod");

// Validates req[source] (body/query/params) against a Zod schema, replacing
// it with the parsed (and coerced/trimmed) value so controllers only ever
// see clean input.
const validate = (schema, source = "body") => (req, res, next) => {
  try {
    req[source] = schema.parse(req[source]);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400);
      return next(new Error(error.issues[0]?.message || "Invalid input"));
    }
    next(error);
  }
};

module.exports = validate;
