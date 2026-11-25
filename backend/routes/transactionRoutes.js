const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/', upload.single('receipt'), createTransaction);
router.put('/:id', upload.single('receipt'), updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
