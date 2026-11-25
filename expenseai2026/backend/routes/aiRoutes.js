const express = require('express');
const router = express.Router();
const { getAIInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAIInsights);
router.get('/insights', getAIInsights);
router.post('/insights', getAIInsights);
router.get('/summary', getAIInsights);
router.post('/summary', getAIInsights);

module.exports = router;
