const express = require('express');
const router = express.Router();
const { getReportSummary } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getReportSummary);
router.get('/summary', getReportSummary);
router.get('/categories', getReportSummary);
router.get('/trends', getReportSummary);

module.exports = router;
