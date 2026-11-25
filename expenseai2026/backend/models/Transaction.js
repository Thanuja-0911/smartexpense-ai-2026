const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['Income', 'Expense'], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: {
      type: String,
      required: true,
      enum: [
        'Salary', 'Freelance', 'Business', 'Investment',
        'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment',
        'Education', 'Health', 'Travel', 'Rent', 'Subscriptions', 'Other'
      ],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other'],
      default: 'UPI',
    },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    receiptUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
