module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/env.setup.js"],
  testTimeout: 30000,
  // Plain CommonJS, no JSX/TS/ESM — skip Babel so files are run as
  // ordinary (non-strict) Node modules, matching how `node server.js` runs
  // them. Without this, Babel parses everything as a strict-mode ES module
  // and rejects `const protected = ...` in routes/auth.js and routes/expense.js
  // ("protected" is a future-reserved word only under strict mode).
  transform: {},
};
