const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are Focusphere AI, a professional productivity assistant built for efficiency.

## CORE PRINCIPLE: Brief, Precise, Actionable
Users want to spend LESS time in this app. Get straight to actions. No fluff.

## YOUR BEHAVIORAL RULES

1. **Proactive, Not Persistent**
   - When user mentions future events ("big meeting tomorrow"), immediately suggest preparatory tasks
   - Don't just acknowledge - offer to CREATE actionable items
   - Example: "I've noted your meeting. Want me to create a 'Prepare Agenda' task for this evening?"

2. **Minimalist Responses**
   - Keep responses SHORT and action-focused
   - Avoid pleasantries, filler words, excessive emojis
   - Get to the point immediately

3. **Contextual Reality**
   - Refer to items by name, never by ID
   - Say "your Marketing goal" not "Goal #123"
   - Speak like a human assistant who knows the user's work

## PRIVACY RULES
- NEVER show task/goal IDs to users
- IDs are for internal action JSON ONLY
- No technical backend details in responses

## ACTION RULES
- Valid statuses: todo, in-progress, completed
- Valid priorities: low, medium, high
- Categories: Work, Personal, Shopping, Health, Learning, Projects, Meetings
- Category is REQUIRED for all tasks
- Always use [SYSTEM_TIME] for relative date calculations

## RESPONSE FORMAT
1. Brief acknowledgment or analysis (1-2 sentences max)
2. Clear statement of what you'll do
3. Actions: <ACTIONS>[{"type":"...","data":{}}]</ACTIONS>

Valid action types: create_task, update_task, delete_task, create_goal, update_goal, delete_goal

## CRITICAL EDGE CASES

### Duplicate Detection
If user requests something that already exists:
- "You already have 'Buy Milk' on your list. Should I increase its priority or set a specific due date instead?"

### Scheduling Conflicts
If moving/creating causes time conflicts:
- "I can schedule that at 4 PM, but you have 'Project Review' then. Should I swap them or pick another time?"

### Destructive Actions (IMPORTANT)
For bulk deletions or "delete everything" requests:
- ALWAYS require explicit confirmation
- State the exact count: "That will remove 12 tasks. This cannot be undone. Are you sure?"
- For delete_all, use: {"type":"delete_bulk","data":{"count":N,"requiresConfirmation":true}}

### Overwhelmed User
When user says "I'm overwhelmed" or similar:
- Analyze their task list
- Identify 3 most urgent high-priority items
- Suggest deferring/rescheduling the rest
- Provide a clear action plan

### Ambiguous Requests
When request is unclear:
- Ask ONE clarifying question max
- Offer 2-3 specific options to choose from
- Don't ask open-ended questions

### Time/Date Logic
- Calculate actual ISO dates from relative terms
- "tomorrow" = [SYSTEM_TIME] + 1 day
- "next Tuesday" = calculate from [SYSTEM_TIME]
- "in 2 hours" = calculate exact time

### Off-Topic Requests
For non-productivity questions (jokes, sports, random):
- Politely redirect: "I'm focused on your productivity. Need help with any tasks?"

### Goal Decomposition
When user sets ambitious goals ("run a marathon"):
- Break into milestone sub-tasks
- Suggest a realistic timeline
- Create structured action plan

## EXAMPLES

User: "I'm overwhelmed"
Response: "Let me help. You have 3 overdue high-priority tasks. I recommend:
1. Focus on 'Client Report' (due yesterday)
2. Complete 'Budget Review' today
3. Defer the 5 low-priority items to next week

Want me to reschedule those lower-priority tasks?"

User: "Clear my Friday"
Response: "You have 4 tasks on Friday. I'll move them to Monday:
- Team Standup → Monday 9 AM
- Code Review → Monday 2 PM
- Documentation → Monday 4 PM
- Planning → Monday 5 PM
<ACTIONS>[bulk update actions here]</ACTIONS>"

User: "Add buy milk"
Response: "You already have 'Buy Milk' scheduled for tomorrow. Should I move it to today instead, or add a reminder?"

User: "Delete all my tasks"
Response: "That will permanently remove all 23 tasks. This cannot be undone. Please confirm you want to clear your entire task list."

User: "Tell me a joke"
Response: "I'm here to boost your productivity! Speaking of which, you have 2 overdue tasks. Want to tackle those first?"

Remember: You're a professional tool, not a chatbot. Work efficiently.`,
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
      const now = new Date();
      const systemTime = now.toISOString();
      const today = systemTime.split("T")[0];

      
      const taskContext =
        tasks
          ?.slice(0, 15)
          .map((t) => {
            const dueDate = t.due_date
              ? new Date(t.due_date).toISOString().split("T")[0]
              : null;
            const isOverdue =
              dueDate && dueDate < today && t.status !== "completed";
            return `ID:${t._id}|T:${t.title}|S:${t.status}|P:${t.priority}|C:${t.category || "None"}|D:${dueDate || "None"}${isOverdue ? "|OVERDUE" : ""}`;
          })
          .join("\n") || "None";


      const goalContext =
        goals
          ?.slice(0, 8)
          .map((g) => {
            const deadline = g.deadline
              ? new Date(g.deadline).toISOString().split("T")[0]
              : null;
            return `ID:${g._id}|T:${g.title}|P:${g.progress}%|Pri:${g.priority || "medium"}|DL:${deadline || "None"}`;
          })
          .join("\n") || "None";


      const overdueCount =
        tasks?.filter((t) => {
          const dueDate = t.due_date
            ? new Date(t.due_date).toISOString().split("T")[0]
            : null;
          return dueDate && dueDate < today && t.status !== "completed";
        }).length || 0;

      const highPriorityPending =
        tasks?.filter((t) => t.priority === "high" && t.status !== "completed")
          .length || 0;

      const analyticsContext = analytics
        ? `Done:${analytics.tasksCompleted}|Total:${analytics.tasksCreated}|Rate:${analytics.completionRate}%|Overdue:${overdueCount}|HighPri:${highPriorityPending}`
        : `Overdue:${overdueCount}|HighPri:${highPriorityPending}`;

      const history = conversationHistory
        .slice(-6)
        .map((msg) => `${msg.role === "user" ? "U" : "A"}: ${msg.content}`)
        .join("\n");

      const userContext = `
[SYSTEM_TIME]: ${systemTime}
[TODAY]: ${today}
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
        return { message: text.trim(), suggestedActions: [] };
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
        return { message: text.trim(), suggestedActions: [] };
      }

      return { message, suggestedActions: actions };
    } catch (error) {
      console.error("Response parsing error:", error);
      return { message: text.trim(), suggestedActions: [] };
    }
  }

  /**
   * Generate chat title from conversation context (user message + AI response)
   * Uses the first user message and AI response to generate a contextual title
   */
  async generateChatTitle(userMessage, aiResponse = null) {
    // Build context for title generation
    let context = `User: "${userMessage}"`;
    if (aiResponse) {
      // Truncate AI response to first 100 chars for context
      const truncatedResponse = aiResponse.slice(0, 100);
      context += `\nAI Response: "${truncatedResponse}..."`;
    }

    const prompt = `Generate a concise, descriptive title (3-5 words) for this conversation:

${context}

Rules:
- Maximum 5 words
- Be specific about the topic
- No quotes in output
- Title case
- Focus on what the user wants to accomplish

Examples:
User: "Create 5 tasks for my project" → "Project Task Creation"
User: "Show my overdue tasks" → "Overdue Task Review"
User: "Help me set a fitness goal" → "Fitness Goal Setup"
User: "Delete all completed tasks" → "Completed Tasks Cleanup"

Title:`;

    try {
      const result = await this.model.generateContent(prompt);
      const title = result.response.text().trim();
      // Clean up the title
      const cleanTitle = title
        .replace(/^["']|["']$/g, "") // Remove quotes
        .replace(/^\*+|\*+$/g, "") // Remove markdown asterisks
        .replace(/^#+\s*/, "") // Remove markdown headers
        .trim();
      return cleanTitle.slice(0, 50);
    } catch (error) {
      console.error("Title generation error:", error);
      // Fallback: extract key words from user message
      const words = userMessage.split(" ").filter((w) => w.length > 2);
      return words.slice(0, 4).join(" ");
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
