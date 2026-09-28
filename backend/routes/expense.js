const router = require("express").Router();
const {
  addExpense,
  getUserExpenses,
  updateUserExpense,
  deleteUserExpense,
} = require("../controllers/expenseController");
const protected = require("../middleware/auth");
const validate = require("../middleware/validate");
const { addExpenseSchema, updateExpenseSchema } = require("../schemas/expenseSchemas");

router.use(protected);

router.route("/").post(validate(addExpenseSchema), addExpense);
router.route("/").get(getUserExpenses);
router.route("/:id").patch(validate(updateExpenseSchema), updateUserExpense);
router.route("/:id").delete(deleteUserExpense);

module.exports = router;
