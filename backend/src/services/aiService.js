const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  getDefaultDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split("T")[0];
  }

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
   * Chat with AI - WITH ANALYTICS + IMAGE SUPPORT
   */
  async chat(message, context) {
    const { tasks, goals, conversationHistory, analytics, imageData } = context;

    const tasksInfo =
      tasks
        ?.slice(0, 10)
        .map(
          (t) =>
            `- "${t.title}" (ID: ${t._id}, Status: ${t.status}, Priority: ${t.priority}, Category: ${t.category})`
        )
        .join("\n") || "No tasks";

    // Format goals with full details including tasks
    const goalsInfo =
      goals
        ?.slice(0, 10)
        .map((g) => {
          const taskCount = g.tasks?.length || 0;
          const description = g.description || "No description";
          const taskDetails = g.taskDetails || [];

          let goalInfo = `- **"${g.title}"** (ID: ${g._id})
  Description: ${description}
  Progress: ${g.progress || 0}%
  Priority: ${g.priority}
  Tasks: ${taskCount} task${taskCount !== 1 ? "s" : ""}`;

          // Add task details if available
          if (taskDetails.length > 0) {
            const taskSummary = taskDetails
              .slice(0, 5)
              .map(
                (t) => `    • ${t.title} (${t.status}, ${t.priority} priority)`
              )
              .join("\n");
            goalInfo += `\n  Associated Tasks:\n${taskSummary}`;
            if (taskDetails.length > 5) {
              goalInfo += `\n    • ...and ${taskDetails.length - 5} more`;
            }
          }

          return goalInfo;
        })
        .join("\n\n") || "No goals";

    // Add analytics context if available
    const analyticsInfo = analytics
      ? `
ANALYTICS DATA:
- Tasks Completed: ${analytics.tasksCompleted}
- Tasks Created: ${analytics.tasksCreated}
- Completion Rate: ${analytics.completionRate}%
- Average Completion Time: ${analytics.averageCompletionTime}
- Top Categories: ${analytics.tasksByCategory
          ?.slice(0, 3)
          .map((c) => `${c.name} (${c.count})`)
          .join(", ")}
- Priority Distribution: High: ${analytics.tasksByPriority?.find((p) => p.name === "high")?.count || 0}, Medium: ${analytics.tasksByPriority?.find((p) => p.name === "medium")?.count || 0}, Low: ${analytics.tasksByPriority?.find((p) => p.name === "low")?.count || 0}
`
      : "";

    const systemPrompt = `You are FocusSphere AI, a helpful productivity assistant.

Current User Context:
- User has ${tasks?.length || 0} tasks (${tasks?.filter((t) => t.status === "completed").length || 0} completed)
- User has ${goals?.length || 0} active goals

CURRENT TASKS:
${tasksInfo}

CURRENT GOALS:
${goalsInfo}

${analyticsInfo}

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
When creating multiple items, use a single ACTIONS block with array of actions.

**ANALYTICS QUERIES:**
When user asks about their productivity, stats, progress, or performance:
- Reference the analytics data above
- Provide specific numbers and percentages
- Compare categories and priorities
- Suggest improvements based on data

**GOAL QUERIES:**
When user asks about their goals:
- DEFAULT RESPONSE: Show title, description, progress, and number of tasks for each goal
- If user asks for "details" or "more info": Also include priority and specific task breakdowns
- Format clearly with bullet points or sections
- Be conversational and helpful

Examples:
"What are my goals?" → List each goal with title, description, progress, task count
"Tell me about my Planning goal" → Show all details including tasks within that goal
"Go more in depth" → Add priority info and task details

Examples:
"How am I doing?" → Use analytics to give overview
"What should I focus on?" → Analyze category distribution
"Am I getting better?" → Compare completion rate and time

**IMAGE ANALYSIS:**
When user uploads an image:
- Describe what you see
- Extract any tasks, todos, or action items
- If it's a screenshot of text, transcribe it
- If it's a diagram or chart, explain it
- Offer to create tasks from the image content

**IMPORTANT RULES:**
- Only use ACTIONS when user explicitly asks to create/update/delete
- Use actual task/goal IDs from the context above when updating/deleting
- For updates, only include fields that are changing
- Set reasonable defaults (priority: "medium", category: "General" if not specified)
- For due dates, use ISO format (YYYY-MM-DD)
- Be conversational and friendly
- Use analytics data to provide insights when asked`;

    let fullPrompt = systemPrompt + "\n\nConversation:\n";

    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg) => {
        fullPrompt += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
      });
    }

    fullPrompt += `User: ${message}\nAssistant:`;

    try {
      let result;

      // If image data is provided, use vision model
      if (imageData) {
        const imagePart = {
          inlineData: {
            data: imageData.split(",")[1], 
            mimeType: imageData.match(/data:([^;]+);/)[1],
          },
        };

        result = await this.model.generateContent([fullPrompt, imagePart]);
      } else {
        result = await this.model.generateContent(fullPrompt);
      }

      const responseText = result.response.text();

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

        actions = actions.filter((action) => {
          if (!action.type || !action.data) return false;

          const validTypes = [
            "create_task",
            "update_task",
            "delete_task",
            "create_goal",
            "update_goal",
            "delete_goal",
          ];
          if (!validTypes.includes(action.type)) return false;

          if (action.type === "create_task") {
            action.data = {
              title: action.data.title || "Untitled Task",
              category: action.data.category || "General",
              priority: action.data.priority || "medium",
              description: action.data.description || "",
              ...(action.data.due_date
                ? { due_date: action.data.due_date }
                : {}),
              status: "todo",
            };
          }

          if (action.type === "update_task") {
            if (!action.data.taskId || !action.data.updates) return false;
          }

          if (action.type === "create_goal") {
            action.data = {
              title: action.data.title || "Untitled Goal",
              description: action.data.description || "",
              priority: action.data.priority || "medium",
              deadline: action.data.deadline || null,
            };
          }

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

  async prioritizeTasks(tasks) {
    if (!tasks || tasks.length === 0) return [];

    const tasksDescription = tasks
      .map(
        (t, i) =>
          `${i + 1}. "${t.title}" - Due: ${t.due_date || "No deadline"}, Priority: ${t.priority}`
      )
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
${taskDescription ? `Description: ${taskDescription}` : ""}
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
      const insights = result.response
        .text()
        .split("•")
        .filter((s) => s.trim())
        .slice(0, 3);
      return insights.length
        ? insights
        : [
            "Complete tasks consistently",
            "Focus on high-priority items",
            "Break down large tasks",
          ];
    } catch (error) {
      return [
        "Complete tasks consistently",
        "Focus on priorities",
        "Break down tasks",
      ];
    }
  }

  async suggestSchedule(tasks) {
    const desc = tasks
      .filter((t) => t.status !== "completed")
      .slice(0, 10)
      .map((t) => `- ${t.title} (${t.priority})`)
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
    const categories = [...new Set(tasks.map((t) => t.category))].join(", ");
    const prompt = `Categories: ${categories}. Current goals: ${existingGoals.map((g) => g.title).join(", ")}. Suggest 2-3 new goals (<8 words each). JSON: ["Goal 1"]`;

    try {
      const result = await this.model.generateContent(prompt);
      const match = result.response.text().match(/\[.*\]/s);
      return match ? JSON.parse(match[0]) : [];
    } catch (error) {
      return [];
    }
  }

async generateChatTitle(firstMessage) {
  const prompt = `Generate a short, concise title (3-6 words max) for a chat conversation that starts with this message: "${firstMessage}"

Rules:
- Maximum 6 words
- No quotes or punctuation at the end
- Descriptive but brief
- Title case

Examples:
"Create 5 tasks for my project" → "Project Task Creation"
"Help me plan my week" → "Weekly Planning"
"What's my productivity like?" → "Productivity Analysis"

Title:`;

  try {
    const result = await this.model.generateContent(prompt);
    const title = result.response.text().trim();
    
    // Clean up the title (remove quotes if present)
    const cleanTitle = title.replace(/^["']|["']$/g, '');
    
    // Limit to 50 characters max
    return cleanTitle.slice(0, 50);
  } catch (error) {
    console.error('Title generation error:', error);
    // Fallback to first few words
    return firstMessage.split(' ').slice(0, 4).join(' ');
  }
}
}



module.exports = new AIService();
