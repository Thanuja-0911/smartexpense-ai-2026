const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const { getIsConnected } = require('../config/db');
const { memoryTransactions } = require('./transactionController');
const { memoryBudgets } = require('./budgetController');
const { memoryGoals } = require('./goalController');
const { generateFinancialInsights } = require('../services/geminiService');

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const period = req.query.period || 'this_month';
    const isConnected = getIsConnected();

    let transactions = [];
    let userBudgets = [];
    let userGoals = [];

    if (isConnected) {
      transactions = await Transaction.find({ userId }).sort({ date: -1 });
      userBudgets = await Budget.find({ userId });
      userGoals = await Goal.find({ userId });
    } else {
      transactions = memoryTransactions.filter(
        (t) => t.userId === userId
      );
      userBudgets = memoryBudgets.filter(
        (b) => b.userId === userId
      );
      userGoals = memoryGoals.filter(
        (g) => g.userId === userId
      );
    }

    // Filter transactions by selected time period
    const now = new Date();
    let startDate = new Date(0);

    if (period === 'this_week') {
      startDate = new Date(now.setDate(now.getDate() - now.getDay()));
    } else if (period === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      transactions = transactions.filter((t) => new Date(t.date) >= startDate && new Date(t.date) <= endDate);
    } else if (period === 'this_year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    if (period !== 'last_month') {
      transactions = transactions.filter((t) => new Date(t.date) >= startDate);
    }

    // Dynamic Financial Logic Calculations
    let totalIncome = 0;
    let totalExpenses = 0;

    const categoryMap = {};

    transactions.forEach((tx) => {
      if (tx.type === 'Income') {
        totalIncome += tx.amount;
      } else if (tx.type === 'Expense') {
        totalExpenses += tx.amount;
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
      }
    });

    const totalBalance = totalIncome - totalExpenses;
    const totalSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((totalSavings / totalIncome) * 100)) : 0;

    // Format Expense by Category for Donut Chart
    const expenseByCategory = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: categoryMap[cat],
      percentage: totalExpenses > 0 ? Math.round((categoryMap[cat] / totalExpenses) * 100) : 0,
    }));

    // Income vs Expense area/bar chart data
    const monthlyTrendMap = {};

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      const monthKey = d.toLocaleString('en-US', { month: 'short' });
      if (!monthlyTrendMap[monthKey]) {
        monthlyTrendMap[monthKey] = { month: monthKey, Income: 0, Expense: 0, Savings: 0 };
      }
      if (tx.type === 'Income') {
        monthlyTrendMap[monthKey].Income += tx.amount;
      } else {
        monthlyTrendMap[monthKey].Expense += tx.amount;
      }
      monthlyTrendMap[monthKey].Savings = monthlyTrendMap[monthKey].Income - monthlyTrendMap[monthKey].Expense;
    });

    const incomeVsExpense = Object.values(monthlyTrendMap);

    // AI Insight snippet generation
    const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      amount: categoryMap[cat],
      percentage: totalExpenses > 0 ? Math.round((categoryMap[cat] / totalExpenses) * 100) : 0,
    }));

    const aiData = await generateFinancialInsights({
      totalIncome,
      totalExpenses,
      totalSavings,
      savingsRate,
      categoryBreakdown,
      budgets: userBudgets,
      goals: userGoals,
      timePeriod: period.replace('_', ' '),
    });

    return res.json({
      success: true,
      data: {
        summary: {
          totalBalance,
          totalIncome,
          totalExpenses,
          totalSavings,
          savingsRate,
          incomeTrendPercent: 12.5,
          expenseTrendPercent: -4.2,
        },
        recentTransactions: transactions.slice(0, 5),
        expenseByCategory,
        incomeVsExpense,
        spendingTrend: incomeVsExpense,
        aiSummary: aiData,
        activeBudgetsCount: userBudgets.length,
        activeGoalsCount: userGoals.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMonthlyTrend = async (req, res) => {
  try {
    const userId = req.user.id;
    const isConnected = getIsConnected();
    let transactions = isConnected
      ? await Transaction.find({ userId })
      : memoryTransactions.filter((t) => t.userId === userId);

    const monthlyMap = {};
    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      const month = d.toLocaleString('en-US', { month: 'long' });
      if (!monthlyMap[month]) monthlyMap[month] = { month, income: 0, expense: 0 };
      if (tx.type === 'Income') monthlyMap[month].income += tx.amount;
      else monthlyMap[month].expense += tx.amount;
    });

    return res.json({ success: true, data: Object.values(monthlyMap) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCategoryBreakdown = async (req, res) => {
  try {
    const userId = req.user.id;
    const isConnected = getIsConnected();
    let transactions = isConnected
      ? await Transaction.find({ userId, type: 'Expense' })
      : memoryTransactions.filter((t) => (t.userId === userId) && t.type === 'Expense');

    const catMap = {};
    transactions.forEach((tx) => {
      catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
    });

    const result = Object.keys(catMap).map((cat) => ({
      category: cat,
      amount: catMap[cat],
    }));

    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardData, getMonthlyTrend, getCategoryBreakdown };
