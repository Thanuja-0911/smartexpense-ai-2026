const Transaction = require('../models/Transaction');
const { getIsConnected } = require('../config/db');
const { memoryTransactions } = require('./transactionController');

const getReportSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month', startDate: qStart, endDate: qEnd } = req.query;
    const isConnected = getIsConnected();

    let transactions = [];
    if (isConnected) {
      transactions = await Transaction.find({ userId });
    } else {
      transactions = memoryTransactions.filter(
        (t) => t.userId === userId || t.userId === 'user_demo_101'
      );
    }

    const now = new Date();
    let startDate = new Date(0);
    let endDate = new Date();

    if (qStart) startDate = new Date(qStart);
    else if (period === 'week') startDate = new Date(now.setDate(now.getDate() - 7));
    else if (period === 'month') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (period === 'year') startDate = new Date(now.getFullYear(), 0, 1);

    if (qEnd) endDate = new Date(qEnd);

    const filtered = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= startDate && d <= endDate;
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryMap = {};
    const trendMap = {};

    filtered.forEach((tx) => {
      const amt = tx.amount;
      const dateStr = new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (!trendMap[dateStr]) {
        trendMap[dateStr] = { date: dateStr, Income: 0, Expense: 0 };
      }

      if (tx.type === 'Income') {
        totalIncome += amt;
        trendMap[dateStr].Income += amt;
      } else {
        totalExpenses += amt;
        trendMap[dateStr].Expense += amt;
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + amt;
      }
    });

    const totalSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((totalSavings / totalIncome) * 100)) : 0;

    const categories = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      amount: categoryMap[cat],
      percentage: totalExpenses > 0 ? Math.round((categoryMap[cat] / totalExpenses) * 100) : 0,
    }));

    const trends = Object.values(trendMap);

    return res.json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          totalSavings,
          savingsRate,
          transactionCount: filtered.length,
        },
        categories,
        trends,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getReportSummary };
