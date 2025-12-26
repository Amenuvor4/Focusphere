const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * Get default due date (2 days from now)
   */
  getDefaultDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
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
${tasks?.slice(0, 5).map((t) => `- ${t.title} (${t.status}) - Priority: ${t.priority}`).join("\n") || "No tasks"}

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
   * Chat with AI - WITH ACTION DETECTION (CREATE, UPDATE, DELETE)
   */
  async chat(message, context) {
    const { tasks, goals, conversationHistory } = context;

    // Format tasks with IDs for AI to reference
    const tasksInfo = tasks?.slice(0, 10).map(t => 
      `- "${t.title}" (ID: ${t._id}, Status: ${t.status}, Priority: ${t.priority}, Category: ${t.category})`
    ).join('\n') || 'No tasks';

    const goalsInfo = goals?.slice(0, 5).map(g =>
      `- "${g.title}" (ID: ${g._id}, Progress: ${g.progress}%, Priority: ${g.priority})`
    ).join('\n') || 'No goals';

    const systemPrompt = `You are FocusSphere AI, a helpful productivity assistant.

Current User Context:
- User has ${tasks?.length || 0} tasks (${tasks?.filter((t) => t.status === "completed").length || 0} completed)
- User has ${goals?.length || 0} active goals

CURRENT TASKS:
${tasksInfo}

CURRENT GOALS:
${goalsInfo}

CRITICAL: When the user asks you to CREATE, UPDATE, or DELETE tasks/goals, respond with:
1. A friendly message explaining what you'll do
2. An ACTIONS block with structured data

**ACTION FORMATS:**

=== CREATE TASK ===
"I'll create that task for you!
<ACTIONS>
[{"type":"create_task","data":{"title":"Task name","category":"Work","priority":"high","description":"Details","due_date":"2025-12-30"}}]
</ACTIONS>"

=== UPDATE TASK ===
"I'll update that task for you!
<ACTIONS>
[{"type":"update_task","data":{"taskId":"ACTUAL_TASK_ID","updates":{"title":"New title","priority":"high","status":"in-progress"}}}]
</ACTIONS>"

=== DELETE TASK ===
"I can remove that for you!
<ACTIONS>
[{"type":"delete_task","data":{"taskId":"ACTUAL_TASK_ID","reason":"User requested"}}]
</ACTIONS>"

=== CREATE GOAL ===
"Let's create that goal!
<ACTIONS>
[{"type":"create_goal","data":{"title":"Goal name","description":"Details","priority":"medium","deadline":"2026-01-01"}}]
</ACTIONS>"

=== UPDATE GOAL ===
"I'll update that goal!
<ACTIONS>
[{"type":"update_goal","data":{"goalId":"ACTUAL_GOAL_ID","updates":{"title":"New title","progress":50}}}]
</ACTIONS>"

=== MULTIPLE ACTIONS ===
When creating multiple items, use a single ACTIONS block:
"I'll create these tasks for you!
<ACTIONS>
[
  {"type":"create_task","data":{"title":"Task 1","category":"Work","priority":"high"}},
  {"type":"create_task","data":{"title":"Task 2","category":"Work","priority":"medium"}},
  {"type":"create_task","data":{"title":"Task 3","category":"Work","priority":"low"}}
]
</ACTIONS>"

**IMPORTANT RULES:**
- Only use ACTIONS when user explicitly asks to create/update/delete
- Use actual task/goal IDs from the context above when updating/deleting
- For updates, only include fields that are changing
- Set reasonable defaults:
  - priority: "medium" if not specified
  - category: "General" if not specified
  - due_date: Don't include if not specified (backend will set default)
- For due dates, use ISO format (YYYY-MM-DD)
- Be conversational and friendly
- If user asks general questions, respond normally without ACTIONS

**UPDATE EXAMPLES:**
User: "Change the priority of 'Finish report' to high"
You: Look up the task ID, then respond with update_task action

User: "Mark my grocery task as completed"
You: Find task ID, respond with update_task changing status to "completed"

User: "Update my fitness goal progress to 75%"
You: Find goal ID, respond with update_goal changing progress to 75

User: "Rename 'Buy stuff' task to 'Buy groceries'"
You: Find task ID, respond with update_task changing title

**SEARCH LOGIC:**
- When user says "my X task", look for task with title containing X
- When user says "the X goal", look for goal with title containing X
- If multiple matches, pick the first one or ask for clarification
- Always use the actual _id from the context above`;

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
      const { message: cleanMessage, actions } = this.parseResponse(responseText);

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
      const actionsMatch = text.match(/<ACTIONS>([\s\S]*?)<\/ACTIONS>/);

      if (!actionsMatch) {
        return { message: text.trim(), actions: [] };
      }

      const message = text.replace(/<ACTIONS>[\s\S]*?<\/ACTIONS>/g, "").trim();
      const actionsJson = actionsMatch[1].trim();
      let actions = [];

      try {
        actions = JSON.parse(actionsJson);

        // Validate and clean actions
        actions = actions.filter((action) => {
          if (!action.type || !action.data) return false;

          const validTypes = [
            "create_task", "update_task", "delete_task",
            "create_goal", "update_goal", "delete_goal"
          ];
          if (!validTypes.includes(action.type)) return false;

          // Set defaults for create_task
          if (action.type === "create_task") {
            action.data = {
              title: action.data.title || "Untitled Task",
              category: action.data.category || "General",
              priority: action.data.priority || "medium",
              description: action.data.description || "",
              // Only include due_date if explicitly provided, otherwise backend will set default
              ...(action.data.due_date ? { due_date: action.data.due_date } : {}),
              status: "todo",
            };
          }

          // Set defaults for update_task
          if (action.type === "update_task") {
            if (!action.data.taskId || !action.data.updates) return false;
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

          // Validate update_goal
          if (action.type === "update_goal") {
            if (!action.data.goalId || !action.data.updates) return false;
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
      .map((t, i) => `${i + 1}. "${t.title}" - Due: ${t.due_date || "No deadline"}, Priority: ${t.priority}`)
      .join("\n");

    const prompt = `Rank these tasks by urgency (most important first).
Tasks: ${tasksDescription}
Respond with ONLY a JSON array: [3, 1, 4, 2, 5]`;

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

  async suggestTaskBreakdown(taskTitle, taskDescription) {
    const prompt = `Break down into 3-5 subtasks: ${taskTitle}
Respond with JSON: [{"title":"Subtask 1","priority":"medium"}]`;

    try {
      const result = await this.model.generateContent(prompt);
      const match = result.response.text().match(/\[[\s\S]*\]/);
      return match ? JSON.parse(match[0]) : [];
    } catch (error) {
      return [];
    }
  }

  async generateInsights(analyticsData) {
    const { tasksCompleted, completionRate, tasksByCategory } = analyticsData;
    const prompt = `Analyze: ${tasksCompleted} tasks, ${completionRate}% rate. Give 3 insights (each <25 words), start with "•"`;

    try {
      const result = await this.model.generateContent(prompt);
      const insights = result.response.text().split("•").filter(s => s.trim()).slice(0, 3);
      return insights.length ? insights : [
        "Complete tasks consistently",
        "Focus on high-priority items",
        "Break down large tasks"
      ];
    } catch (error) {
      return ["Complete tasks consistently", "Focus on priorities", "Break down tasks"];
    }
  }

  async suggestSchedule(tasks) {
    const desc = tasks.filter(t => t.status !== "completed").slice(0, 10)
      .map(t => `- ${t.title} (${t.priority})`)
      .join("\n");
    const prompt = `Suggest order for: ${desc}. Brief (2-3 sentences).`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      return "Focus on high-priority tasks first.";
    }
  }

  async suggestGoals(tasks, existingGoals) {
    const categories = [...new Set(tasks.map(t => t.category))].join(", ");
    const prompt = `Categories: ${categories}. Current goals: ${existingGoals.map(g => g.title).join(", ")}. Suggest 2-3 new goals (<8 words each). JSON: ["Goal 1"]`;

    try {
      const result = await this.model.generateContent(prompt);
      const match = result.response.text().match(/\[.*\]/s);
      return match ? JSON.parse(match[0]) : [];
    } catch (error) {
      return [];
    }
  }
}

module.exports = new AIService();