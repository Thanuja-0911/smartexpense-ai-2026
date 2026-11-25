const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const { getIsConnected } = require('../config/db');
const { memoryTransactions } = require('./transactionController');
const { memoryBudgets } = require('./budgetController');
const { memoryGoals } = require('./goalController');
const { generateFinancialInsights } = require('../services/geminiService');

const getAIInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const isConnected = getIsConnected();

    let transactions = [];
    let userBudgets = [];
    let userGoals = [];

    if (isConnected) {
      transactions = await Transaction.find({ userId });
      userBudgets = await Budget.find({ userId });
      userGoals = await Goal.find({ userId });
    } else {
      transactions = memoryTransactions.filter(
        (t) => t.userId === userId || t.userId === 'user_demo_101'
      );
      userBudgets = memoryBudgets.filter(
        (b) => b.userId === userId || b.userId === 'user_demo_101'
      );
      userGoals = memoryGoals.filter(
        (g) => g.userId === userId || g.userId === 'user_demo_101'
      );
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryMap = {};

    transactions.forEach((tx) => {
      if (tx.type === 'Income') totalIncome += tx.amount;
      else if (tx.type === 'Expense') {
        totalExpenses += tx.amount;
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
      }
    });

    const totalSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((totalSavings / totalIncome) * 100)) : 0;

    const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      amount: categoryMap[cat],
      percentage: totalExpenses > 0 ? Math.round((categoryMap[cat] / totalExpenses) * 100) : 0,
    }));

    const aiResult = await generateFinancialInsights({
      totalIncome,
      totalExpenses,
      totalSavings,
      savingsRate,
      categoryBreakdown,
      budgets: userBudgets,
      goals: userGoals,
      timePeriod: 'this month',
    });

    return res.json({
      success: true,
      data: {
        ...aiResult,
        disclaimer: 'AI recommendations are generated based on your financial patterns for informational purposes and do not constitute formal financial advice.',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAIInsights };
