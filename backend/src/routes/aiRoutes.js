const express = require('express');
const aiController = require('../controllers/aiController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// ===================================
// TEST ENDPOINT - PUBLIC (NO AUTH)
// ===================================
router.get('/test', (req, res) => {
  res.json({ message: 'AI API is working' });
});

// ===================================
// PROTECT ALL ROUTES AFTER THIS LINE
// ===================================
router.use(protect);

/**
 * @route   GET /api/ai/analyze
 * @desc    Get AI analysis of user's productivity data
 * @access  Private
 */
router.get('/analyze', aiController.analyzeData);

/**
 * @route   GET /api/ai/prioritize
 * @desc    Get AI-prioritized task list
 * @access  Private
 */
router.get('/prioritize', aiController.prioritizeTasks);

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI assistant
 * @access  Private
 * @body    { message: string, conversationHistory?: array }
 */
router.post('/chat', aiController.chat);

/**
 * @route   POST /api/ai/breakdown
 * @desc    Get task breakdown suggestions
 * @access  Private
 * @body    { title: string, description?: string }
 */
router.post('/breakdown', aiController.breakdownTask);

/**
 * @route   GET /api/ai/insights
 * @desc    Get AI insights for analytics page
 * @access  Private
 * @query   ?timeRange=Week|Month|Quarter|Year
 */
router.get('/insights', aiController.getAnalyticsInsights);

/**
 * @route   GET /api/ai/schedule
 * @desc    Get AI task schedule suggestions
 * @access  Private
 */
router.get('/schedule', aiController.suggestSchedule);

/**
 * @route   GET /api/ai/suggest-goals
 * @desc    Get AI goal suggestions
 * @access  Private
 */
router.get('/suggest-goals', aiController.suggestGoals);

/**
 * @route   GET /api/ai/smart-suggestions
 * @desc    Get 4 smart AI prompt suggestions based on user data
 * @access  Private
 */
router.get('/smart-suggestions', aiController.getSmartSuggestions);

module.exports = router;