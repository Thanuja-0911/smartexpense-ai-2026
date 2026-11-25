const Goal = require('../models/Goal');
const { getIsConnected } = require('../config/db');

const memoryGoals = [
  {
    _id: 'g_101',
    userId: 'user_demo_101',
    name: 'New M3 MacBook Pro',
    targetAmount: 180000,
    savedAmount: 65000,
    targetDate: new Date(2026, 11, 31),
    description: 'Upgrading work machine for high performance development & AI workloads.',
  },
  {
    _id: 'g_102',
    userId: 'user_demo_101',
    name: 'Emergency Fund',
    targetAmount: 250000,
    savedAmount: 175000,
    targetDate: new Date(2027, 5, 30),
    description: '6 Months of essential living expenses safety net.',
  },
  {
    _id: 'g_103',
    userId: 'user_demo_101',
    name: 'Europe Vacation',
    targetAmount: 150000,
    savedAmount: 45000,
    targetDate: new Date(2027, 8, 15),
    description: '14-day trip across Switzerland, Italy, and France.',
  },
];

// Helper to compute goal metrics
const enrichGoal = (goal) => {
  const target = goal.targetAmount || 0;
  const saved = goal.savedAmount || 0;
  const remaining = Math.max(0, target - saved);
  const percentage = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

  // Calculate estimated monthly saving required
  const now = new Date();
  const targetDate = new Date(goal.targetDate);
  const diffTime = targetDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.max(1, Math.ceil(diffDays / 30));

  const monthlyRequired = Math.round(remaining / diffMonths);

  return {
    _id: goal._id,
    name: goal.name,
    targetAmount: goal.targetAmount,
    savedAmount: goal.savedAmount,
    targetDate: goal.targetDate,
    description: goal.description,
    remaining,
    percentage,
    monthlyRequired,
    daysRemaining: diffDays > 0 ? diffDays : 0,
  };
};

// Get Goal by ID
const getGoalById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isConnected = getIsConnected();

    if (isConnected) {
      const goal = await Goal.findOne({ _id: id, userId });
      if (!goal) return res.status(404).json({ success: false, message: 'Goal not found or unauthorized' });
      return res.json({ success: true, data: enrichGoal(goal) });
    } else {
      const goal = memoryGoals.find((g) => g._id === id && g.userId === userId);
      if (!goal) return res.status(404).json({ success: false, message: 'Goal not found or unauthorized' });
      return res.json({ success: true, data: enrichGoal(goal) });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Goals
const getGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const isConnected = getIsConnected();

    if (isConnected) {
      const goals = await Goal.find({ userId }).sort({ targetDate: 1 });
      const enriched = goals.map(enrichGoal);
      return res.json({ success: true, data: enriched });
    } else {
      const userGoals = memoryGoals.filter(
        (g) => g.userId === userId
      );
      const enriched = userGoals.map(enrichGoal);
      return res.json({ success: true, data: enriched });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create Goal
const createGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, targetAmount, savedAmount, targetDate, description } = req.body;

    if (!name || !targetAmount || !targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, target amount, and target date are required',
      });
    }

    const isConnected = getIsConnected();

    if (isConnected) {
      const goal = await Goal.create({
        userId,
        name,
        targetAmount: parseFloat(targetAmount),
        savedAmount: parseFloat(savedAmount || 0),
        targetDate: new Date(targetDate),
        description: description || '',
      });

      return res.status(201).json({
        success: true,
        message: 'Goal created successfully',
        data: enrichGoal(goal),
      });
    } else {
      const newGoal = {
        _id: 'g_' + Date.now(),
        userId,
        name,
        targetAmount: parseFloat(targetAmount),
        savedAmount: parseFloat(savedAmount || 0),
        targetDate: new Date(targetDate),
        description: description || '',
      };
      memoryGoals.push(newGoal);

      return res.status(201).json({
        success: true,
        message: 'Goal created successfully',
        data: enrichGoal(newGoal),
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Goal / Add Money
const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, targetAmount, savedAmount, addAmount, targetDate, description } = req.body;

    const isConnected = getIsConnected();

    if (isConnected) {
      const goal = await Goal.findOne({ _id: id, userId });
      if (!goal) return res.status(404).json({ success: false, message: 'Goal not found or unauthorized' });

      if (name) goal.name = name;
      if (targetAmount) goal.targetAmount = parseFloat(targetAmount);
      if (savedAmount !== undefined) goal.savedAmount = parseFloat(savedAmount);
      if (addAmount) goal.savedAmount += parseFloat(addAmount);
      if (targetDate) goal.targetDate = new Date(targetDate);
      if (description !== undefined) goal.description = description;

      await goal.save();
      return res.json({ success: true, message: 'Goal updated', data: enrichGoal(goal) });
    } else {
      const index = memoryGoals.findIndex(
        (g) => g._id === id && g.userId === userId
      );
      if (index === -1) return res.status(404).json({ success: false, message: 'Goal not found or unauthorized' });

      if (name) memoryGoals[index].name = name;
      if (targetAmount) memoryGoals[index].targetAmount = parseFloat(targetAmount);
      if (savedAmount !== undefined) memoryGoals[index].savedAmount = parseFloat(savedAmount);
      if (addAmount) memoryGoals[index].savedAmount += parseFloat(addAmount);
      if (targetDate) memoryGoals[index].targetDate = new Date(targetDate);
      if (description !== undefined) memoryGoals[index].description = description;

      return res.json({
        success: true,
        message: 'Goal updated',
        data: enrichGoal(memoryGoals[index]),
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Goal
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const isConnected = getIsConnected();

    if (isConnected) {
      const goal = await Goal.findOneAndDelete({ _id: id, userId });
      if (!goal) return res.status(404).json({ success: false, message: 'Goal not found or unauthorized' });
      return res.json({ success: true, message: 'Goal deleted' });
    } else {
      const index = memoryGoals.findIndex(
        (g) => g._id === id && g.userId === userId
      );
      if (index === -1) return res.status(404).json({ success: false, message: 'Goal not found or unauthorized' });
      memoryGoals.splice(index, 1);
      return res.json({ success: true, message: 'Goal deleted' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  memoryGoals,
};
