const aiService = require("../services/aiService");
const Task = require("../models/Task");
const Goal = require("../models/Goal");

/**
 * Get AI analysis of user's productivity data
 */
exports.analyzeData = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ user_id: userId });
    const goals = await Goal.find({ userId });

    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const completionRate =
      tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    const insights = await aiService.analyzeUserData({
      tasks,
      goals,
      completionRate,
    });

    res.json({ insights });
  } catch (error) {
    console.error("AI analysis error:", error);
    res.status(500).json({ error: "Failed to analyze data" });
  }
};

/**
 * Get AI-prioritized task list
 */
exports.prioritizeTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({
      user_id: userId,
      status: { $ne: "completed" },
    });

    if (tasks.length === 0) {
      return res.json({ tasks: [] });
    }

    const prioritizedTasks = await aiService.prioritizeTasks(tasks);
    res.json({ tasks: prioritizedTasks });
  } catch (error) {
    console.error("AI prioritization error:", error);
    res.status(500).json({ error: "Failed to prioritize tasks" });
  }
};

/**
 * Chat with AI (with analytics and image support)
 */
exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory, imageData, isNewChat } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Fetch user's tasks and goals for context
    const tasks = await Task.find({ user_id: userId });
    const goals = await Goal.find({ userId });

    // Enrich goals with their actual task data
    const enrichedGoals = goals.map((goal) => {
      const goalTasks = tasks.filter((task) =>
        goal.tasks?.includes(task._id.toString())
      );
      return {
        ...goal.toObject(),
        taskDetails: goalTasks.map((t) => ({
          title: t.title,
          status: t.status,
          priority: t.priority,
          category: t.category,
        })),
      };
    });

    // Fetch analytics data
    const analytics = await getAnalyticsData(userId);

    const response = await aiService.chat(message, {
      tasks,
      goals: enrichedGoals,
      conversationHistory: conversationHistory || [],
      analytics,
      imageData,
    });

    let suggestedTitle = null;
    if (isNewChat) {
      suggestedTitle = await aiService.generateChatTitle(message);
    }

    res.json({
      response: {
        message: response.message,
        suggestedActions: response.suggestedActions,
      },
      suggestedTitle,
    });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ error: "Failed to process message" });
  }
};

/**
 * Helper function to get analytics data
 */
async function getAnalyticsData(userId) {
  try {
    const tasks = await Task.find({ user_id: userId });

    const tasksCompleted = tasks.filter((t) => t.status === "completed").length;
    const tasksCreated = tasks.length;
    const completionRate =
      tasksCreated > 0 ? Math.round((tasksCompleted / tasksCreated) * 100) : 0;

    // Calculate average completion time
    const completedTasks = tasks.filter(
      (t) => t.status === "completed" && t.updatedAt
    );
    const totalTime = completedTasks.reduce((sum, task) => {
      const completionTime =
        new Date(task.updatedAt) - new Date(task.createdAt);
      return sum + completionTime;
    }, 0);
    const averageTime =
      completedTasks.length > 0 ? totalTime / completedTasks.length : 0;
    const averageDays = (averageTime / (1000 * 60 * 60 * 24)).toFixed(1);
    const averageCompletionTime = `${averageDays} days`;

    // Group by category
    const tasksByCategory = {};
    tasks.forEach((task) => {
      tasksByCategory[task.category] =
        (tasksByCategory[task.category] || 0) + 1;
    });

    const categoryData = Object.entries(tasksByCategory).map(
      ([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / tasksCreated) * 100),
      })
    );

    // Group by priority
    const tasksByPriority = [
      {
        name: "high",
        count: tasks.filter((t) => t.priority === "high").length,
      },
      {
        name: "medium",
        count: tasks.filter((t) => t.priority === "medium").length,
      },
      { name: "low", count: tasks.filter((t) => t.priority === "low").length },
    ];

    return {
      tasksCompleted,
      tasksCreated,
      completionRate,
      averageCompletionTime,
      tasksByCategory: categoryData,
      tasksByPriority,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return null;
  }
}

/**
 * Get task breakdown suggestions
 */
exports.breakdownTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    const subtasks = await aiService.suggestTaskBreakdown(title, description);
    res.json({ subtasks });
  } catch (error) {
    console.error("AI task breakdown error:", error);
    res.status(500).json({ error: "Failed to break down task" });
  }
};

/**
 * Get analytics insights
 */
exports.getAnalyticsInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange } = req.query;

    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "Week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "Month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "Quarter":
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case "Year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0);
    }

    const tasks = await Task.find({
      user_id: userId,
      createdAt: { $gte: startDate },
    });

    const tasksCompleted = tasks.filter((t) => t.status === "completed").length;
    const tasksCreated = tasks.length;
    const completionRate =
      tasksCreated > 0 ? Math.round((tasksCompleted / tasksCreated) * 100) : 0;

    const completedTasks = tasks.filter(
      (t) => t.status === "completed" && t.updatedAt
    );
    const totalTime = completedTasks.reduce((sum, task) => {
      const completionTime =
        new Date(task.updatedAt) - new Date(task.createdAt);
      return sum + completionTime;
    }, 0);
    const averageTime =
      completedTasks.length > 0 ? totalTime / completedTasks.length : 0;
    const averageDays = (averageTime / (1000 * 60 * 60 * 24)).toFixed(1);
    const averageCompletionTime = `${averageDays} days`;

    const tasksByCategory = {};
    tasks.forEach((task) => {
      tasksByCategory[task.category] =
        (tasksByCategory[task.category] || 0) + 1;
    });

    const categoryData = Object.entries(tasksByCategory).map(
      ([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / tasksCreated) * 100),
      })
    );

    const insights = await aiService.generateInsights({
      tasksCompleted,
      completionRate,
      tasksByCategory: categoryData,
      averageCompletionTime,
    });

    res.json({ insights });
  } catch (error) {
    console.error("AI analytics insights error:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
};

/**
 * Get task schedule suggestions
 */
exports.suggestSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({
      user_id: userId,
      status: { $ne: "completed" },
    });

    const suggestion = await aiService.suggestSchedule(tasks);
    res.json({ suggestion });
  } catch (error) {
    console.error("AI schedule error:", error);
    res.status(500).json({ error: "Failed to generate schedule" });
  }
};

/**
 * Get goal suggestions
 */
exports.suggestGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ user_id: userId });
    const goals = await Goal.find({ userId });

    const suggestions = await aiService.suggestGoals(tasks, goals);
    res.json({ suggestions });
  } catch (error) {
    console.error("AI goal suggestion error:", error);
    res.status(500).json({ error: "Failed to suggest goals" });
  }
};
