const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { getIsConnected } = require('../config/db');
const { memoryTransactions } = require('./transactionController');

const memoryBudgets = [];

// Helper to compute budget status
const calculateBudgetStatus = (amount, spent) => {
  const percentage = amount > 0 ? Math.round((spent / amount) * 100) : 0;
  let status = 'healthy'; // healthy | warning | critical | exceeded

  if (percentage >= 100) status = 'exceeded';
  else if (percentage >= 90) status = 'critical';
  else if (percentage >= 70) status = 'warning';

  return {
    amount,
    spent,
    remaining: Math.max(0, amount - spent),
    percentage,
    status,
  };
};

// Get Budget by ID
const getBudgetById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isConnected = getIsConnected();

    if (isConnected) {
      const budget = await Budget.findOne({ _id: id, userId });
      if (!budget) return res.status(404).json({ success: false, message: 'Budget not found or unauthorized' });
      return res.json({ success: true, data: budget });
    } else {
      const budget = memoryBudgets.find((b) => b._id === id && b.userId === userId);
      if (!budget) return res.status(404).json({ success: false, message: 'Budget not found or unauthorized' });
      return res.json({ success: true, data: budget });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Budgets for User
const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const isConnected = getIsConnected();

    if (isConnected) {
      const budgets = await Budget.find({ userId, month, year });

      // Calculate spent amount for each budget category
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const budgetList = await Promise.all(
        budgets.map(async (b) => {
          const result = await Transaction.aggregate([
            {
              $match: {
                userId: b.userId,
                type: 'Expense',
                category: b.category,
                date: { $gte: startDate, $lte: endDate },
              },
            },
            { $group: { _id: null, totalSpent: { $sum: '$amount' } } },
          ]);

          const spent = result.length > 0 ? result[0].totalSpent : 0;
          const statusInfo = calculateBudgetStatus(b.amount, spent);

          return {
            _id: b._id,
            category: b.category,
            amount: b.amount,
            month: b.month,
            year: b.year,
            ...statusInfo,
          };
        })
      );

      return res.json({ success: true, data: budgetList });
    } else {
      const userBudgets = memoryBudgets.filter(
        (b) => b.userId === userId && b.month === month && b.year === year
      );

      const userTxs = memoryTransactions.filter(
        (t) => t.userId === userId && t.type === 'Expense'
      );

      const budgetList = userBudgets.map((b) => {
        const spent = userTxs
          .filter((t) => t.category === b.category)
          .reduce((sum, t) => sum + t.amount, 0);

        const statusInfo = calculateBudgetStatus(b.amount, spent);

        return {
          _id: b._id,
          category: b.category,
          amount: b.amount,
          month: b.month,
          year: b.year,
          ...statusInfo,
        };
      });

      return res.json({ success: true, data: budgetList });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create Budget
const createBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, amount, month, year } = req.body;

    if (!category || !amount) {
      return res.status(400).json({ success: false, message: 'Category and amount are required' });
    }

    const now = new Date();
    const bMonth = parseInt(month) || now.getMonth() + 1;
    const bYear = parseInt(year) || now.getFullYear();
    const bAmount = parseFloat(amount);

    const isConnected = getIsConnected();

    if (isConnected) {
      const existing = await Budget.findOne({ userId, category, month: bMonth, year: bYear });
      if (existing) {
        existing.amount = bAmount;
        await existing.save();
        return res.json({ success: true, message: 'Budget updated', data: existing });
      }

      const budget = await Budget.create({
        userId,
        category,
        amount: bAmount,
        month: bMonth,
        year: bYear,
      });

      return res.status(201).json({ success: true, message: 'Budget created', data: budget });
    } else {
      const existingIndex = memoryBudgets.findIndex(
        (b) =>
          b.userId === userId &&
          b.category === category &&
          b.month === bMonth &&
          b.year === bYear
      );

      if (existingIndex !== -1) {
        memoryBudgets[existingIndex].amount = bAmount;
        return res.json({ success: true, message: 'Budget updated', data: memoryBudgets[existingIndex] });
      }

      const newB = {
        _id: 'b_' + Date.now(),
        userId,
        category,
        amount: bAmount,
        month: bMonth,
        year: bYear,
      };
      memoryBudgets.push(newB);
      return res.status(201).json({ success: true, message: 'Budget created', data: newB });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Budget
const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, category } = req.body;

    const isConnected = getIsConnected();

    if (isConnected) {
      const budget = await Budget.findOne({ _id: id, userId });
      if (!budget) return res.status(404).json({ success: false, message: 'Budget not found or unauthorized' });

      if (amount) budget.amount = parseFloat(amount);
      if (category) budget.category = category;

      await budget.save();
      return res.json({ success: true, message: 'Budget updated', data: budget });
    } else {
      const index = memoryBudgets.findIndex(
        (b) => b._id === id && b.userId === userId
      );
      if (index === -1) return res.status(404).json({ success: false, message: 'Budget not found or unauthorized' });

      if (amount) memoryBudgets[index].amount = parseFloat(amount);
      if (category) memoryBudgets[index].category = category;

      return res.json({ success: true, message: 'Budget updated', data: memoryBudgets[index] });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Budget
const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const isConnected = getIsConnected();

    if (isConnected) {
      const budget = await Budget.findOneAndDelete({ _id: id, userId });
      if (!budget) return res.status(404).json({ success: false, message: 'Budget not found or unauthorized' });
      return res.json({ success: true, message: 'Budget deleted' });
    } else {
      const index = memoryBudgets.findIndex(
        (b) => b._id === id && b.userId === userId
      );
      if (index === -1) return res.status(404).json({ success: false, message: 'Budget not found or unauthorized' });
      memoryBudgets.splice(index, 1);
      return res.json({ success: true, message: 'Budget deleted' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  memoryBudgets,
};
