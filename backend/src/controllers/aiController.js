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

    console.log('=== AI RESPONSE ===');
    console.log('Full response:', JSON.stringify(response, null, 2));
    console.log('suggestedActions:', response.suggestedActions);
    console.log('==================');

    if (response.suggestedActions && response.suggestedActions.length > 0) {
      response.suggestedActions = await Promise.all(
        response.suggestedActions.map(async (action, index) => {
          console.log(`\n Processing action ${index + 1}:`, action.type);
          console.log('Action data before enrichment:', JSON.stringify(action.data, null, 2));

          // Enrich delete_task actions with full task details
          if (action.type === "delete_task") {
            const taskId = action.data.taskId || action.data.id;
            console.log('Delete task - taskId:', taskId);
            console.log('Available task IDs:', tasks.map(t => t._id.toString()));

            if (taskId) {
              const task = tasks.find((t) => t._id.toString() === taskId);
              console.log('Found task:', task ? task.title : 'NOT FOUND');

              if (task) {
                // Enrich with all task details
                action.data = {
                  ...action.data,
                  taskId: taskId,
                  title: task.title,
                  category: task.category,
                  priority: task.priority,
                  status: task.status,
                  due_date: task.due_date,
                  description: task.description
                };
                console.log('Enriched delete task action.data:', action.data);
              } else {
                console.log('WARNING: Task not found for deletion!');
              }
            }
          }

          // Enrich update_task actions with current task details
          if (action.type === "update_task" && action.data.taskId) {
            const taskId = action.data.taskId;
            console.log('Looking for task to update with ID:', taskId);
            const task = tasks.find((t) => t._id.toString() === taskId);
            console.log('Found task:', task ? task.title : 'NOT FOUND');
            if (task) {
              // Keep the current values if not being updated
              action.data.title = action.data.updates?.title || task.title;
              action.data.category = action.data.updates?.category || task.category;
              action.data.priority = action.data.updates?.priority || task.priority;
              action.data.status = action.data.updates?.status || task.status;
              action.data.due_date = action.data.updates?.due_date || task.due_date;
              console.log('Enriched update action:', action.data);
            }
          }

          // Enrich delete_goal actions with full goal details
          if (action.type === "delete_goal") {
            const goalId = action.data.goalId || action.data.id;
            console.log('Delete goal - goalId:', goalId);
            console.log('Available goal IDs:', goals.map(g => g._id.toString()));

            if (goalId) {
              const goal = goals.find((g) => g._id.toString() === goalId);
              console.log('Found goal:', goal ? goal.title : 'NOT FOUND');

              if (goal) {
                // Enrich with all goal details
                action.data = {
                  ...action.data,
                  goalId: goalId,
                  title: goal.title,
                  description: goal.description,
                  priority: goal.priority,
                  deadline: goal.deadline
                };
                console.log('Enriched delete goal action.data:', action.data);
              } else {
                console.log('WARNING: Goal not found for deletion!');
              }
            }
          }

          // Enrich update_goal actions with current goal details
          if (action.type === "update_goal" && action.data.goalId) {
            const goalId = action.data.goalId;
            console.log('Looking for goal to update with ID:', goalId);
            const goal = goals.find((g) => g._id.toString() === goalId);
            console.log('Found goal:', goal ? goal.title : 'NOT FOUND');
            if (goal) {
              // Keep the current values if not being updated
              action.data.title = action.data.updates?.title || goal.title;
              action.data.description = action.data.updates?.description || goal.description;
              action.data.priority = action.data.updates?.priority || goal.priority;
              action.data.deadline = action.data.updates?.deadline || goal.deadline;
              console.log('Enriched update goal action:', action.data);
            }
          }

          console.log('Action data after enrichment:', JSON.stringify(action.data, null, 2));
          return action;
        })
      );

      console.log('ENRICHMENT COMPLETE')
    } else{
      console.log("NO SUGGESTED ACTIONS FOUND IN RESPONSE")
    }

    let suggestedTitle = null;
    if (isNewChat) {
      // Generate title using both user message and AI response for better context
      suggestedTitle = await aiService.generateChatTitle(message, response.message);
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

/**
 * Get smart AI prompt suggestions based on user data
 * Returns 4 contextual suggestions for the chat widget/assistant
 */
exports.getSmartSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ user_id: userId });
    const goals = await Goal.find({ userId });

    // Default suggestions for new users (no data)
    const defaultSuggestions = [
      {
        icon: "📝",
        title: "Create Tasks",
        description: "Set up your first tasks to get started",
        prompt: "Help me create 5 tasks to organize my day"
      },
      {
        icon: "🎯",
        title: "Set Goals",
        description: "Define goals to track your progress",
        prompt: "Help me create a goal for improving my productivity"
      },
      {
        icon: "📅",
        title: "Plan My Week",
        description: "Organize your upcoming schedule",
        prompt: "Help me plan my tasks for this week"
      },
      {
        icon: "🔗",
        title: "Sync Calendar",
        description: "Connect Google Calendar (coming soon)",
        prompt: "Tell me about integrating with Google Calendar"
      }
    ];

    // If user has no tasks and no goals, return defaults
    if (tasks.length === 0 && goals.length === 0) {
      return res.json({ suggestions: defaultSuggestions, hasData: false });
    }

    // Calculate analytics for smart suggestions
    const analytics = await getAnalyticsData(userId);
    const overdueTasks = tasks.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      return new Date(t.due_date) < new Date();
    });
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const incompleteGoals = goals.filter(g => g.progress < 100);

    // Build smart suggestions based on user data
    const smartSuggestions = [];

    // Priority 1: Overdue tasks
    if (overdueTasks.length > 0) {
      smartSuggestions.push({
        icon: "⚠️",
        title: "Overdue Tasks",
        description: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
        prompt: "Show me my overdue tasks and help me prioritize them"
      });
    }

    // Priority 2: High priority tasks
    if (highPriorityTasks.length > 0) {
      smartSuggestions.push({
        icon: "🔥",
        title: "High Priority",
        description: `${highPriorityTasks.length} high priority task${highPriorityTasks.length > 1 ? 's' : ''} need attention`,
        prompt: "Show me my high priority tasks"
      });
    }

    // Priority 3: In-progress tasks
    if (inProgressTasks.length > 0) {
      smartSuggestions.push({
        icon: "🚀",
        title: "In Progress",
        description: `${inProgressTasks.length} task${inProgressTasks.length > 1 ? 's' : ''} in progress`,
        prompt: "Show me my tasks that are in progress"
      });
    }

    // Priority 4: Goals needing attention
    if (incompleteGoals.length > 0) {
      const lowestProgressGoal = incompleteGoals.sort((a, b) => a.progress - b.progress)[0];
      smartSuggestions.push({
        icon: "🎯",
        title: "Goal Progress",
        description: `"${lowestProgressGoal.title.slice(0, 20)}${lowestProgressGoal.title.length > 20 ? '...' : ''}" at ${lowestProgressGoal.progress}%`,
        prompt: `Help me make progress on my goal "${lowestProgressGoal.title}"`
      });
    }

    // Priority 5: Create more tasks if few exist
    if (todoTasks.length < 3 && tasks.length < 10) {
      smartSuggestions.push({
        icon: "➕",
        title: "Add Tasks",
        description: "Create more tasks to stay organized",
        prompt: "Help me create tasks for my current projects"
      });
    }

    // Priority 6: Low completion rate
    if (analytics && analytics.completionRate < 50 && tasks.length >= 5) {
      smartSuggestions.push({
        icon: "📊",
        title: "Boost Productivity",
        description: `${analytics.completionRate}% completion rate`,
        prompt: "Give me tips to improve my task completion rate"
      });
    }

    // Priority 7: Plan for tomorrow
    smartSuggestions.push({
      icon: "📅",
      title: "Plan Ahead",
      description: "Organize your upcoming tasks",
      prompt: "Help me plan my tasks for tomorrow"
    });

    // Priority 8: Calendar integration (always available)
    smartSuggestions.push({
      icon: "🔗",
      title: "Sync Calendar",
      description: "Connect Google Calendar (coming soon)",
      prompt: "Tell me about integrating with Google Calendar"
    });

    // Return top 4 suggestions
    res.json({
      suggestions: smartSuggestions.slice(0, 4),
      hasData: true,
      stats: {
        totalTasks: tasks.length,
        totalGoals: goals.length,
        overdue: overdueTasks.length,
        completionRate: analytics?.completionRate || 0
      }
    });
  } catch (error) {
    console.error("Smart suggestions error:", error);
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
};
