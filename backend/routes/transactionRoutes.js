const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

const router = express.Router();

function validateTransaction(body) {
  const { title, amount, type, category, date } = body;
  if (
    typeof title !== "string" || !title.trim() || title.trim().length > 100 ||
    typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0 ||
    !["income", "expense"].includes(type) ||
    typeof category !== "string" || !category.trim() || category.trim().length > 50 ||
    !date || !Number.isFinite(Date.parse(date))
  ) {
    return "Provide a title, positive amount, valid type, category, and date.";
  }
  return null;
}

// GET /api/transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1, createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions." });
  }
});

// POST /api/transactions
router.post("/", async (req, res) => {
  const validationError = validateTransaction(req.body);
  if (validationError) return res.status(400).json({ message: validationError });

  try {
    const { title, amount, type, category, date } = req.body;
    const transaction = await Transaction.create({
      title: title.trim(), amount, type, category: category.trim(), date: new Date(date),
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: "Unable to add transaction." });
  }
});

// PUT /api/transactions/:id
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid transaction ID." });
  }
  const validationError = validateTransaction(req.body);
  if (validationError) return res.status(400).json({ message: validationError });

  try {
    const { title, amount, type, category, date } = req.body;
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { title: title.trim(), amount, type, category: category.trim(), date: new Date(date) },
      { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ message: "Transaction not found." });
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: "Unable to update transaction." });
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid transaction ID." });
  }
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found." });
    res.json({ message: "Transaction deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete transaction." });
  }
});

module.exports = router;