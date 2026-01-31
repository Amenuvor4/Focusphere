const express = require("express");
const aiController = require("../controllers/aiController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ===================================
// TEST ENDPOINT - PUBLIC (NO AUTH)
// ===================================
router.get("/test", (req, res) => {
  res.json({ message: "AI API is working" });
});

// ===================================
// PROTECT ALL ROUTES AFTER THIS LINE
// ===================================
router.use(protect);

/**
 * @route   GET /ai/analyze
 * @desc    Get AI analysis of user's productivity data
 * @access  Private
 */
router.get("/analyze", aiController.analyzeData);

/**
 * @route   GET /ai/prioritize
 * @desc    Get AI-prioritized task list
 * @access  Private
 */
router.get("/prioritize", aiController.prioritizeTasks);

/**
 * @route   POST /ai/chat
 * @desc    Chat with AI assistant
 * @access  Private
 * @body    { message: string, conversationHistory?: array }
 */
router.post("/chat", aiController.chat);

/**
 * @route   POST /ai/breakdown
 * @desc    Get task breakdown suggestions
 * @access  Private
 * @body    { title: string, description?: string }
 */
router.post("/breakdown", aiController.breakdownTask);

/**
 * @route   GET /ai/insights
 * @desc    Get AI insights for analytics page
 * @access  Private
 * @query   ?timeRange=Week|Month|Quarter|Year
 */
router.get("/insights", aiController.getAnalyticsInsights);

/**
 * @route   GET /ai/schedule
 * @desc    Get AI task schedule suggestions
 * @access  Private
 */
router.get("/schedule", aiController.suggestSchedule);

/**
 * @route   GET /ai/suggest-goals
 * @desc    Get AI goal suggestions
 * @access  Private
 */
router.get("/suggest-goals", aiController.suggestGoals);

/**
 * @route   GET /ai/smart-suggestions
 * @desc    Get 4 smart AI prompt suggestions based on user data
 * @access  Private
 */
router.get("/smart-suggestions", aiController.getSmartSuggestions);

/**
 * @route   POST /ai/execute-actions
 * @desc    Execute AI-suggested actions directly (for Accept button)
 * @access  Private
 * @body    { actions: array }
 */
router.post("/execute-actions", aiController.executeActions);

/**
 * @route   GET /ai/pending-actions
 * @desc    Get pending actions status for current user
 * @access  Private
 */
router.get("/pending-actions", aiController.getPendingActions);

/**
 * @route   DELETE /ai/pending-actions
 * @desc    Clear pending actions for current user
 * @access  Private
 */
router.delete("/pending-actions", aiController.clearPendingActions);

/**
 * @route   GET /ai/models
 * @desc    Get available AI models info and current status
 * @access  Private
 */
router.get("/models", aiController.getModelsInfo);

/**
 * @route   GET /ai/rate-limit-status
 * @desc    Get current rate limit status and token usage
 * @access  Private
 */
router.get("/rate-limit-status", aiController.getRateLimitStatus);

module.exports = router;
