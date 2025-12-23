const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  /**
   * Analyze user's task and goal data
   */
  async analyzeUserData(userData) {
    const { tasks, goals, completionRate } = userData;

    const prompt = `You are an AI productivity assistant. Analyze this user's data and provide actionable insights.

User Data:
- Total Tasks: ${tasks?.length || 0}
- Completed Tasks: ${tasks?.filter((t) => t.status === "completed").length || 0}
- Completion Rate: ${completionRate}%
- Active Goals: ${goals?.length || 0}

Recent Tasks:
${
  tasks
    ?.slice(0, 5)
    .map((t) => `- ${t.title} (${t.status}) - Priority: ${t.priority}`)
    .join("\n") || "No tasks"
}

Provide 2-3 key insights and 1-2 actionable recommendations. Keep it concise (3-4 sentences).`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("AI analysis error:", error);
      throw new Error("Failed to analyze data");
    }
  }

  /**
   * Chat with AI - WITH ACTION DETECTION
   * Detects when user wants to create/delete tasks or goals
   */
  async chat(message, context) {
    const { tasks, goals, conversationHistory } = context;

    const systemPrompt = `You are FocusSphere AI, a helpful productivity assistant.

Current User Context:
- User has ${tasks?.length || 0} tasks (${tasks?.filter((t) => t.status === "completed").length || 0} completed)
- User has ${goals?.length || 0} active goals
${
  tasks?.length > 0
    ? `\nRecent Tasks:\n${tasks
        .slice(0, 5)
        .map((t) => `- ${t.title} (${t.status}, ${t.priority})`)
        .join("\n")}`
    : ""
}

CRITICAL: When the user asks you to CREATE or DELETE tasks/goals, respond with:
1. A friendly message explaining what you'll do
2. An ACTIONS block with structured data

**ACTION FORMAT:**

For CREATE TASK:
"I'll create that task for you!
<ACTIONS>
[{"type":"create_task","data":{"title":"Task name","category":"Work","priority":"high","description":"Details","due_date":"2025-12-25"}}]
</ACTIONS>"

For DELETE TASK (only if user has existing tasks):
"I can remove that for you!
<ACTIONS>
[{"type":"delete_task","data":{"taskId":"ACTUAL_TASK_ID","reason":"User requested"}}]
</ACTIONS>"

For CREATE GOAL:
"Let's create that goal!
<ACTIONS>
[{"type":"create_goal","data":{"title":"Goal name","description":"Details","priority":"medium","deadline":"2026-01-01"}}]
</ACTIONS>"

For MULTIPLE ACTIONS (e.g. "create 3 tasks"):
"I'll create these tasks for you!
<ACTIONS>
[
  {"type":"create_task","data":{"title":"Task 1","category":"Work","priority":"high"}},
  {"type":"create_task","data":{"title":"Task 2","category":"Work","priority":"medium"}},
  {"type":"create_task","data":{"title":"Task 3","category":"Work","priority":"low"}}
]
</ACTIONS>"

**IMPORTANT RULES:**
- Only use ACTIONS when user explicitly asks to create/delete something
- Use actual task/goal IDs from context when deleting
- Set reasonable defaults (priority: "medium", category: "General" if not specified)
- For due dates, use ISO format (YYYY-MM-DD)
- Be conversational and friendly in your message
- If user asks general questions, respond normally without ACTIONS

Examples:
User: "Create a task to finish the report by Friday"
You: "I'll create that task for you!
<ACTIONS>
[{"type":"create_task","data":{"title":"Finish the report","category":"Work","priority":"high","due_date":"2025-12-27"}}]
</ACTIONS>"

User: "Add 3 tasks for my morning routine"
You: "Great! I'll create these morning routine tasks for you!
<ACTIONS>
[
  {"type":"create_task","data":{"title":"Morning exercise","category":"Personal","priority":"medium"}},
  {"type":"create_task","data":{"title":"Healthy breakfast","category":"Personal","priority":"medium"}},
  {"type":"create_task","data":{"title":"Review daily goals","category":"Personal","priority":"medium"}}
]
</ACTIONS>"

User: "What should I focus on today?"
You: "Based on your tasks, I recommend focusing on your high-priority items first. You have [X] urgent tasks that need attention. Would you like me to create a focused task list for today?"`;

    let fullPrompt = systemPrompt + "\n\nConversation:\n";

    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg) => {
        fullPrompt += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
      });
    }

    fullPrompt += `User: ${message}\nAssistant:`;

    try {
      const result = await this.model.generateContent(fullPrompt);
      const responseText = result.response.text();

      // Parse for actions
      const { message: cleanMessage, actions } =
        this.parseResponse(responseText);

      return {
        message: cleanMessage,
        suggestedActions: actions.length > 0 ? actions : null,
        conversationHistory: [
          ...(conversationHistory || []),
          { role: "user", content: message },
          { role: "assistant", content: cleanMessage },
        ],
      };
    } catch (error) {
      console.error("AI chat error:", error);
      throw new Error("Failed to process chat message");
    }
  }

  /**
   * Parse AI response to extract message and actions
   */
  parseResponse(text) {
    try {
      // Check for ACTIONS block
      const actionsMatch = text.match(/<ACTIONS>([\s\S]*?)<\/ACTIONS>/);

      if (!actionsMatch) {
        return { message: text.trim(), actions: [] };
      }

      // Extract message (everything except ACTIONS block)
      const message = text.replace(/<ACTIONS>[\s\S]*?<\/ACTIONS>/g, "").trim();

      // Parse actions JSON
      const actionsJson = actionsMatch[1].trim();
      let actions = [];

      try {
        actions = JSON.parse(actionsJson);

        // Validate and clean actions
        actions = actions.filter((action) => {
          if (!action.type || !action.data) return false;

          const validTypes = [
            "create_task",
            "delete_task",
            "create_goal",
            "delete_goal",
          ];
          if (!validTypes.includes(action.type)) return false;

          // Set defaults for create_task
          if (action.type === "create_task") {
            action.data = {
              title: action.data.title || "Untitled Task",
              category: action.data.category || "General",
              priority: action.data.priority || "medium",
              description: action.data.description || "",
              due_date: action.data.due_date || null,
              status: "todo",
            };
          }

          // Set defaults for create_goal
          if (action.type === "create_goal") {
            action.data = {
              title: action.data.title || "Untitled Goal",
              description: action.data.description || "",
              priority: action.data.priority || "medium",
              deadline: action.data.deadline || null,
            };
          }

          return true;
        });
      } catch (parseError) {
        console.error("Failed to parse actions JSON:", parseError);
        return { message: text.trim(), actions: [] };
      }

      return { message, actions };
    } catch (error) {
      console.error("Response parsing error:", error);
      return { message: text.trim(), actions: [] };
    }
  }

  /**
   * Prioritize tasks using AI
   */
  async prioritizeTasks(tasks) {
    if (!tasks || tasks.length === 0) return [];

    const tasksDescription = tasks
      .map(
        (t, i) =>
          `${i + 1}. "${t.title}" - Due: ${t.due_date || "No deadline"}, Priority: ${t.priority}, Category: ${t.category}`
      )
      .join("\n");

    const prompt = `Rank these tasks by urgency and importance (most important first).

Tasks:
${tasksDescription}

Respond with ONLY a JSON array of task indices: [3, 1, 4, 2, 5]`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text().trim();

      const match = text.match(/\[[\d,\s]+\]/);
      if (!match) return tasks;

      const ranking = JSON.parse(match[0]);
      return ranking.map((index) => tasks[index - 1]).filter(Boolean);
    } catch (error) {
      console.error("AI prioritization error:", error);
      return tasks;
    }
  }

  /**
   * Suggest task breakdown
   */
  async suggestTaskBreakdown(taskTitle, taskDescription) {
    const prompt = `Break down this task into 3-5 smaller subtasks:

Task: ${taskTitle}
${taskDescription ? `Description: ${taskDescription}` : ""}

Respond with ONLY a JSON array of subtask objects:
[{"title":"Subtask 1","priority":"medium"},{"title":"Subtask 2","priority":"high"}]`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text().trim();

      const match = text.match(/\[[\s\S]*\]/);
      if (!match) return [];

      return JSON.parse(match[0]);
    } catch (error) {
      console.error("AI task breakdown error:", error);
      return [];
    }
  }

  /**
   * Generate productivity insights for analytics
   */
  async generateInsights(analyticsData) {
    const {
      tasksCompleted,
      completionRate,
      tasksByCategory,
      averageCompletionTime,
    } = analyticsData;

    const prompt = `Analyze this productivity data and provide 3 specific, actionable insights:

- Tasks Completed: ${tasksCompleted}
- Completion Rate: ${completionRate}%
- Average Completion Time: ${averageCompletionTime}
- Top Categories: ${tasksByCategory
      ?.slice(0, 3)
      .map((c) => `${c.name} (${c.count})`)
      .join(", ")}

Provide exactly 3 bullet points (each under 25 words), starting with "•"`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();

      const insights = text
        .split("•")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, 3);

      return insights;
    } catch (error) {
      console.error("AI insights error:", error);
      return [
        "Complete tasks consistently to improve productivity",
        "Focus on high-priority items first",
        "Break down large tasks into smaller steps",
      ];
    }
  }

  /**
   * Suggest optimal task scheduling
   */
  async suggestSchedule(tasks) {
    const tasksDescription = tasks
      .filter((t) => t.status !== "completed")
      .slice(0, 10)
      .map(
        (t) =>
          `- ${t.title} (Priority: ${t.priority}, Due: ${t.due_date || "none"})`
      )
      .join("\n");

    const prompt = `Suggest an optimal order to tackle these tasks today:

Tasks:
${tasksDescription}

Provide a brief schedule suggestion (2-3 sentences).`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("AI schedule error:", error);
      return "Focus on high-priority tasks first, then tackle medium-priority items.";
    }
  }

  /**
   * Generate goal recommendations
   */
  async suggestGoals(tasks, existingGoals) {
    const categories = [...new Set(tasks.map((t) => t.category))].join(", ");

    const prompt = `Based on task categories: ${categories}

Current goals: ${existingGoals.map((g) => g.title).join(", ")}

Suggest 2-3 new goals (each under 8 words). Respond with JSON array:
["Goal 1","Goal 2","Goal 3"]`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text().trim();

      const match = text.match(/\[.*\]/s);
      if (!match) return [];

      return JSON.parse(match[0]);
    } catch (error) {
      console.error("AI goal suggestion error:", error);
      return [];
    }
  }
}

module.exports = new AIService();
