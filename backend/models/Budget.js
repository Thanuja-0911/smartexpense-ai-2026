const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment',
        'Education', 'Health', 'Travel', 'Rent', 'Subscriptions', 'Other'
      ],
    },
    amount: { type: Number, required: true, min: 1 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, month: 1, year: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
