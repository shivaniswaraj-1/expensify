const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Expense = require("../models/expense");
const User = require("../models/user");
const getPagination = require("../utils/pagination");

const addExpense = asyncHandler(async (req, res, next) => {
  const { amount, category, description } = req.body;
  if (!amount || !category || !description) {
    res.status(400);
    throw new Error("All fields are Mandatory!");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Expense.create(
      [
        {
          amount,
          category,
          description,
          userId: req.user,
        },
      ],
      {
        session,
      }
    );

    const totalExpenses = Number(req.user.totalExpenses) + Number(amount);

    await User.updateOne(
      { _id: req.user },
      {
        totalExpenses,
      }
    ).session(session);

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Expense created Successfully!",
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500);
    throw new Error("Something went Wrong!");
  } finally {
    session.endSession();
  }
});

const getUserExpenses = asyncHandler(async (req, res, next) => {
  const { page, perPage, skip } = getPagination(req);
  const search = (req.query.search || "").trim();
  const category = req.query.category || "";
  const sortDir = req.query.sortDir === "asc" ? 1 : -1;

  // Search/filter/sort are applied here, before pagination, so results are
  // correct across the user's whole history instead of only the loaded page.
  const filter = { userId: req.user._id };
  if (category) {
    filter.category = category;
  }
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = new RegExp(escaped, "i");
    filter.$or = [{ description: searchRegex }, { category: searchRegex }];
  }

  try {
    const count = await Expense.countDocuments(filter);
    const expenses = await Expense.find(filter)
      .select({ userId: 0 })
      .sort({ amount: sortDir, createdAt: -1 })
      .limit(perPage)
      .skip(skip);

    const totalPages = Math.ceil(count / perPage);

    res.status(200).json({
      expenses,
      currentPage: page,
      totalPages,
      totalItems: count,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Something went Wrong!");
  }
});

const deleteUserExpense = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid Expense Id!");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const expenseToDelete = await Expense.findOne({
      userId: req.user._id,
      _id: id,
    }).session(session);

    if (!expenseToDelete) {
      res.status(404);
      throw new Error("Expense not found");
    }
    // Update the user's totalExpenses
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $inc: { totalExpenses: -expenseToDelete.amount } },
      { session }
    );

    await expenseToDelete.deleteOne({ session }); // Delete the expense
    await session.commitTransaction();

    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    res.status(500);
    throw new Error("Something went Wrong!");
  } finally {
    session.endSession();
  }
});

const updateUserExpense = asyncHandler(async (req, res, next) => {
  const { amount, category, description } = req.body;
  const expenseId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(expenseId)) {
    res.status(400);
    throw new Error("Invalid Expense Id!");
  }

  if (!amount || !category || !description) {
    res.status(400);
    throw new Error("All fields are Mandatory!");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingExpense = await Expense.findOne({
      _id: expenseId,
      userId: req.user._id,
    }).session(session);

    if (!existingExpense) {
      res.status(404);
      throw new Error("Expense not found!");
    }

    const amountDifference =
      Number(amount) - Number(existingExpense.amount);

    await Expense.updateOne(
      { _id: expenseId },
      {
        amount,
        category,
        description,
      },
      { session }
    );

    await User.updateOne(
      { _id: req.user._id },
      { $inc: { totalExpenses: amountDifference } },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Expense updated successfully!",
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500);
    throw new Error("Something went Wrong!");
  } finally {
    session.endSession();
  }
});

module.exports = { addExpense, getUserExpenses, updateUserExpense, deleteUserExpense };
