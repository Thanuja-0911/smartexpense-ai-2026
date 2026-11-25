const Transaction = require('../models/Transaction');
const { getIsConnected } = require('../config/db');
const { uploadToCloudinary } = require('../services/cloudinaryService');

// In-memory transactions storage fallback (empty - no demo data)
const memoryTransactions = [];

// Get Single Transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isConnected = getIsConnected();

    if (isConnected) {
      const transaction = await Transaction.findOne({ _id: id, userId });
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found or unauthorized' });
      }
      return res.json({ success: true, data: transaction });
    } else {
      const transaction = memoryTransactions.find((t) => t._id === id && t.userId === userId);
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found or unauthorized' });
      }
      return res.json({ success: true, data: transaction });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Transactions (with filtering, search, pagination, sorting)
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      search = '',
      type = '',
      category = '',
      startDate = '',
      endDate = '',
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const isConnected = getIsConnected();

    if (isConnected) {
      const query = { userId };

      if (type) query.type = type;
      if (category) query.category = category;
      if (search) {
        query.description = { $regex: search, $options: 'i' };
      }
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const transactions = await Transaction.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Transaction.countDocuments(query);

      return res.json({
        success: true,
        data: transactions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)) || 1,
          limit: parseInt(limit),
        },
      });
    } else {
      let filtered = memoryTransactions.filter((t) => t.userId === userId);

      if (type) filtered = filtered.filter((t) => t.type === type);
      if (category) filtered = filtered.filter((t) => t.category === category);
      if (search) {
        filtered = filtered.filter((t) =>
          t.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (startDate) {
        filtered = filtered.filter((t) => new Date(t.date) >= new Date(startDate));
      }
      if (endDate) {
        filtered = filtered.filter((t) => new Date(t.date) <= new Date(endDate));
      }

      filtered.sort((a, b) => {
        const valA = a[sortBy] instanceof Date ? a[sortBy].getTime() : a[sortBy];
        const valB = b[sortBy] instanceof Date ? b[sortBy].getTime() : b[sortBy];
        return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });

      const total = filtered.length;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginated = filtered.slice(skip, skip + parseInt(limit));

      return res.json({
        success: true,
        data: paginated,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)) || 1,
          limit: parseInt(limit),
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create Transaction
const createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, amount, category, paymentMethod, description, date } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required transaction fields (type, amount, category)',
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Transaction amount must be a positive number',
      });
    }

    let receiptUrl = '';
    if (req.file) {
      receiptUrl = await uploadToCloudinary(req.file.path, 'smartexpense/receipts');
    }

    const txDescription = (description && description.trim()) ? description.trim() : (category || 'Transaction');

    const isConnected = getIsConnected();

    if (isConnected) {
      const transaction = await Transaction.create({
        userId,
        type,
        amount: numAmount,
        category,
        paymentMethod: paymentMethod || 'UPI',
        description: txDescription,
        date: date ? new Date(date) : new Date(),
        receiptUrl,
      });

      return res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: transaction,
      });
    } else {
      const newTx = {
        _id: 'tx_' + Date.now(),
        userId,
        type,
        amount: numAmount,
        category,
        paymentMethod: paymentMethod || 'UPI',
        description: txDescription,
        date: date ? new Date(date) : new Date(),
        receiptUrl,
        createdAt: new Date(),
      };
      memoryTransactions.unshift(newTx);

      return res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: newTx,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Transaction
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { type, amount, category, paymentMethod, description, date } = req.body;

    const isConnected = getIsConnected();

    if (isConnected) {
      const tx = await Transaction.findOne({ _id: id, userId });
      if (!tx) {
        return res.status(404).json({ success: false, message: 'Transaction not found or unauthorized' });
      }

      if (type) tx.type = type;
      if (amount) tx.amount = parseFloat(amount);
      if (category) tx.category = category;
      if (paymentMethod) tx.paymentMethod = paymentMethod;
      if (description !== undefined) {
        tx.description = description ? description.trim() : (category || tx.category || 'Transaction');
      }
      if (date) tx.date = new Date(date);

      if (req.file) {
        tx.receiptUrl = await uploadToCloudinary(req.file.path, 'smartexpense/receipts');
      }

      await tx.save();

      return res.json({
        success: true,
        message: 'Transaction updated successfully',
        data: tx,
      });
    } else {
      const index = memoryTransactions.findIndex(
        (t) => t._id === id && t.userId === userId
      );
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Transaction not found or unauthorized' });
      }

      if (type) memoryTransactions[index].type = type;
      if (amount) memoryTransactions[index].amount = parseFloat(amount);
      if (category) memoryTransactions[index].category = category;
      if (paymentMethod) memoryTransactions[index].paymentMethod = paymentMethod;
      if (description !== undefined) {
        memoryTransactions[index].description = description
          ? description.trim()
          : (category || memoryTransactions[index].category || 'Transaction');
      }
      if (date) memoryTransactions[index].date = new Date(date);

      return res.json({
        success: true,
        message: 'Transaction updated successfully',
        data: memoryTransactions[index],
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const isConnected = getIsConnected();

    if (isConnected) {
      const tx = await Transaction.findOneAndDelete({ _id: id, userId });
      if (!tx) {
        return res.status(404).json({ success: false, message: 'Transaction not found or unauthorized' });
      }
      return res.json({ success: true, message: 'Transaction deleted successfully' });
    } else {
      const index = memoryTransactions.findIndex(
        (t) => t._id === id && t.userId === userId
      );
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Transaction not found or unauthorized' });
      }
      memoryTransactions.splice(index, 1);
      return res.json({ success: true, message: 'Transaction deleted successfully' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  memoryTransactions,
};
