const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
  }

  /**
   * Main chat method with conversation history
   */
  async chat(message, context) {
    const {
      tasks,
      goals,
      conversationHistory = [],
      analytics,
      imageData,
    } = context;

    try {
      // Build conversation context (last 10 messages)
      const recentHistory = conversationHistory.slice(-10);
      const contextText =
        recentHistory.length > 0
          ? recentHistory
              .map(
                (msg) =>
                  `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
              )
              .join("\n")
          : "";

      // Format tasks info
      const tasksInfo =
        tasks
          ?.slice(0, 10)
          .map(
            (t) =>
              `- "${t.title}" (ID: ${t._id}, Status: ${t.status}, Priority: ${t.priority}, Category: ${t.category})`
          )
          .join("\n") || "No tasks";

      // Format goals info
      const goalsInfo =
        goals
          ?.slice(0, 10)
          .map((g) => {
            const taskCount = g.tasks?.length || 0;
            const description = g.description || "No description";
            return `- **"${g.title}"** (ID: ${g._id})\n  Description: ${description}\n  Progress: ${g.progress || 0}%\n  Tasks: ${taskCount}`;
          })
          .join("\n\n") || "No goals";

      // Build system prompt
      const systemPrompt = `You are FocusSphere AI, an intelligent productivity assistant.

CORE BEHAVIORS:
1. **Context Awareness**: Always read the FULL conversation history before responding
2. **Natural Conversation**: Respond like a human - acknowledge comments, ask follow-up questions
3. **No Repetition**: Don't repeat information unless explicitly asked
4. **Smart Responses**:
   - If user says "cool", "thanks", "awesome" → Acknowledge and ask if they need help
   - If user asks a question → Answer directly
   - If user gives a command → Execute and confirm

CURRENT USER CONTEXT:
- User has ${tasks?.length || 0} tasks (${tasks?.filter((t) => t.status === "completed").length || 0} completed)
- User has ${goals?.length || 0} active goals

CURRENT TASKS:
${tasksInfo}

CURRENT GOALS:
${goalsInfo}

CONVERSATION HISTORY:
${contextText}

CURRENT USER MESSAGE: ${message}

CRITICAL: When user asks to CREATE, UPDATE, or DELETE tasks/goals, respond with:
1. A friendly message
2. An ACTIONS block with structured data

**ACTION FORMATS:**
<ACTIONS>
[{"type":"create_task","data":{"title":"Task name","category":"Work","priority":"high"}}]
</ACTIONS>

Respond naturally based on context. If this is a casual acknowledgment, respond conversationally.`;

      let result;

      // Handle image if provided
      if (imageData) {
        const imagePart = {
          inlineData: {
            data: imageData.split(",")[1],
            mimeType: imageData.match(/data:([^;]+);/)[1],
          },
        };
        result = await this.model.generateContent([systemPrompt, imagePart]);
      } else {
        result = await this.model.generateContent(systemPrompt);
      }

      const responseText = result.response.text();
      const { message: cleanMessage, actions } =
        this.parseResponse(responseText);

      return {
        message: cleanMessage,
        suggestedActions: actions.length > 0 ? actions : [],
      };
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error("AI service unavailable");
    }
  }

  /**
   * Parse AI response to extract actions
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
            "create_task",
            "update_task",
            "delete_task",
            "create_goal",
            "update_goal",
            "delete_goal",
          ];
          return validTypes.includes(action.type);
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
   * Generate chat title from first message
   */
  async generateChatTitle(firstMessage) {
    const prompt = `Generate a short title (3-6 words max) for a chat starting with: "${firstMessage}"

Rules:
- Maximum 6 words
- No quotes
- Title case

Examples:
"Create 5 tasks" → "Task Creation"
"Help me plan" → "Planning Assistance"

Title:`;

    try {
      const result = await this.model.generateContent(prompt);
      const title = result.response.text().trim();
      const cleanTitle = title.replace(/^["']|["']$/g, "");
      return cleanTitle.slice(0, 50);
    } catch (error) {
      console.error("Title generation error:", error);
      return firstMessage.split(" ").slice(0, 4).join(" ");
    }
  }

  // Keep your other helper methods below...
  getDefaultDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split("T")[0];
  }
}

module.exports = new AIService();
