const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction:`You are FocusSphere AI. 
      Rules: Use exact IDs for updates/deletes. 
      Status: todo, in-progress, completed. 
      Priority: low, medium, high. 
      Format: <ACTIONS>[{"type":"...","data":{}}]</ACTIONS>.`
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
      //DATA COMPRESSION
      const taskContext = tasks?.slice(0, 10).map(t =>
        `ID:${t._id}|T:${t.title}|S:${t.status}|P:${t.priority}`
      ).join('\n') || "None";

      const goalContext = goals?.slice(0,5).map(g => 
        `ID:${g._id}|T:${g.title}|P${g.progress}%`
      ).join('\n') || "None";

      const analyticsContext = analytics ? 
      `Done:${analytics.tasksCompleted}|Total:${analytics.tasksCreated}|Rate:${analytics.completionRate}%|AvgTime:${analytics.averageCompletionTime}` 
      : "No data";

      const history = conversationHistory.slice(-6).map(msg => 
      `${msg.role === "user" ? "U" : "A"}: ${msg.content}`
    ).join("\n");


    const userContext = `
  [STATS]: ${analyticsContext}
  [TASKS]:
  ${taskContext}
  [GOALS]:
  ${goalContext}
  [HISTORY]:
  ${history}

  User Message: ${message}`;


      let result;
      // Handle image if provided
      if (imageData) {
        const imagePart = {
          inlineData: {
            data: imageData.split(",")[1],
            mimeType: imageData.match(/data:([^;]+);/)[1],
          },
        };
        result = await this.model.generateContent([userContext, imagePart]);
      } else {
        result = await this.model.generateContent(userContext);
      }

      const responseText = result.response.text();
     return this.parseResponse(responseText);
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
