const express = require('express');
const router = express.Router();
const { getDashboardData, getMonthlyTrend, getCategoryBreakdown } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getDashboardData);
router.get('/monthly', getMonthlyTrend);
router.get('/categories', getCategoryBreakdown);

module.exports = router;
