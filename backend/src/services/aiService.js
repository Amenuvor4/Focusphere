const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-2.5-flash-lite for better cost/performance ratio
    // Can be overridden via GEMINI_MODEL env var
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
    console.log(`[AIService] Using model: ${modelName}`);
    this.model = this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: `You are Focusphere AI, a professional productivity assistant built for efficiency.

## CORE PRINCIPLE: Brief, Precise, Accurate
Users want to spend LESS time in this app. Answer questions accurately, suggest actions only when needed.

## CRITICAL: INFORMATIONAL vs ACTION QUERIES

**INFORMATIONAL QUERIES** (DO NOT generate actions):
- "How many tasks/goals do I have?" → Just count from [TASKS] and [GOALS] data and answer
- "Show me my tasks" → List them from the data provided
- "What's my progress?" → Summarize from the data
- "What's overdue?" → Check dates and list overdue items
- Any question asking for information, counts, or status

**ACTION QUERIES** (DO generate actions):
- "Create a task for..." → Generate create_task action
- "Delete my tasks" → Generate delete action
- "Update the priority of..." → Generate update action
- Any request to CREATE, DELETE, UPDATE, or MODIFY items

## YOUR BEHAVIORAL RULES

1. **Read the Data First**
   - ALWAYS count tasks/goals accurately from the [TASKS] and [GOALS] sections provided
   - Each line in [TASKS] is one task, each line in [GOALS] is one goal
   - Count them correctly before answering

2. **Minimalist Responses**
   - Keep responses SHORT
   - Avoid pleasantries, filler words, excessive emojis
   - Get to the point immediately

3. **Contextual Reality**
   - Refer to items by name, never by ID
   - Say "your Marketing goal" not "Goal #123"
   - Speak like a human assistant who knows the user's work

4. **Proactive Suggestions** (only for action-oriented conversations)
   - When user mentions future events ("big meeting tomorrow"), OFFER to create tasks
   - Example: "Want me to create a 'Prepare Agenda' task for this evening?"

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

**For informational queries:**
- Just answer the question directly
- NO <ACTIONS> tag needed
- Count accurately from the data provided

**For action requests:**
1. Brief acknowledgment (1 sentence)
2. Actions: <ACTIONS>[{"type":"...","data":{}}]</ACTIONS>

Valid action types: create_task, update_task, delete_task, delete_all_tasks, create_goal, update_goal, delete_goal, delete_all_goals

## CRITICAL: ACTION TAG FORMAT
ONLY include <ACTIONS> tags when the user explicitly wants to CREATE, UPDATE, or DELETE something.
Do NOT include actions for questions like "how many", "show me", "what is", "list my", etc.
The JSON inside MUST be valid - no trailing commas, all strings quoted.

CORRECT format:
<ACTIONS>[{"type":"create_task","data":{"title":"Task name","category":"Work","priority":"high"}}]</ACTIONS>

INCORRECT (will fail):
<ACTIONS>[{type:"create_task",data:{title:"Task"}}]</ACTIONS>  // Missing quotes
<ACTIONS>[{"type":"create_task","data":{"title":"Task",}}]</ACTIONS>  // Trailing comma

## CONFIRMATION BEHAVIOR
When proposing actions, DO NOT say "I've done X" or "I've deleted X" - the action hasn't happened yet!
Instead use future tense:
- "I'll delete these 5 tasks. Say 'yes' to confirm."
- "Here are the tasks I'll create. Confirm to proceed."
- "I'll update the priority. Just say 'ok' to confirm."

The system handles confirmation detection automatically - users can say "yes", "confirm", "go ahead", etc.

## CRITICAL EDGE CASES

### Duplicate Detection
If user requests something that already exists:
- "You already have 'Buy Milk' on your list. Should I increase its priority or set a specific due date instead?"

### Scheduling Conflicts
If moving/creating causes time conflicts:
- "I can schedule that at 4 PM, but you have 'Project Review' then. Should I swap them or pick another time?"

### Destructive Actions (IMPORTANT)
For bulk deletions or "delete everything" requests:
- ALWAYS require explicit confirmation first
- State the exact count: "That will remove 12 tasks. This cannot be undone. Are you sure?"
- For deleting all tasks, use: {"type":"delete_all_tasks","data":{}}
- For deleting all goals, use: {"type":"delete_all_goals","data":{}}
- For deleting both, include BOTH actions in the array

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

### Informational Queries (NO actions)

User: "How many tasks do I have?"
Response: "You have 4 tasks total: 2 high priority, 1 medium, and 1 low."
(NO <ACTIONS> tag - this is just information)

User: "What are my goals?"
Response: "You have 3 goals:
1. Learn Python (45% complete)
2. Fitness Challenge (20% complete)
3. Read 12 Books (75% complete)"
(NO <ACTIONS> tag - this is just information)

User: "What's overdue?"
Response: "You have 2 overdue tasks: 'Submit Report' (due Jan 25) and 'Call Client' (due Jan 27)."
(NO <ACTIONS> tag - this is just information)

### Action Queries (WITH actions)

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
Response: "That will permanently remove all 23 tasks. This cannot be undone. Please confirm."
<ACTIONS>[{"type":"delete_all_tasks","data":{}}]</ACTIONS>

User: "Delete all my tasks and goals" (after confirmation)
Response: "Deleting all tasks and goals now."
<ACTIONS>[{"type":"delete_all_tasks","data":{}},{"type":"delete_all_goals","data":{}}]</ACTIONS>

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

      // Increased history window from 6 to 12 for better context retention
      const history = conversationHistory
        .slice(-12)
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
   * Enhanced with debug logging and JSON recovery
   */
  parseResponse(text) {
    try {
      console.log('[AIService] === PARSING AI RESPONSE ===');
      console.log('[AIService] Raw response length:', text?.length);

      const actionsMatch = text.match(/<ACTIONS>([\s\S]*?)<\/ACTIONS>/);

      if (!actionsMatch) {
        // Check if the response mentions actions but has no tags
        const actionKeywords = /\b(creat|delet|updat|add|remov)\w*/i;
        if (actionKeywords.test(text)) {
          console.log('[AIService] WARNING: Response mentions actions but no <ACTIONS> tags found');
          console.log('[AIService] Response preview:', text.substring(0, 200));
        }
        return { message: text.trim(), suggestedActions: [] };
      }

      const message = text.replace(/<ACTIONS>[\s\S]*?<\/ACTIONS>/g, "").trim();
      let actionsJson = actionsMatch[1].trim();
      let actions = [];

      console.log('[AIService] Found ACTIONS tag, JSON content:', actionsJson.substring(0, 500));

      try {
        // Attempt to fix common JSON issues before parsing
        actionsJson = this.fixCommonJsonIssues(actionsJson);
        actions = JSON.parse(actionsJson);

        // Ensure actions is an array
        if (!Array.isArray(actions)) {
          actions = [actions];
        }

        // Validate and filter actions
        const validTypes = [
          "create_task",
          "update_task",
          "delete_task",
          "delete_all_tasks",
          "create_goal",
          "update_goal",
          "delete_goal",
          "delete_all_goals",
        ];

        const originalCount = actions.length;
        actions = actions.filter((action, index) => {
          if (!action.type) {
            console.log(`[AIService] Action ${index} rejected: missing type`);
            return false;
          }
          if (!action.data) {
            console.log(`[AIService] Action ${index} rejected: missing data`);
            return false;
          }
          if (!validTypes.includes(action.type)) {
            console.log(`[AIService] Action ${index} rejected: invalid type "${action.type}"`);
            return false;
          }
          return true;
        });

        if (actions.length < originalCount) {
          console.log(`[AIService] Filtered out ${originalCount - actions.length} invalid actions`);
        }

        console.log(`[AIService] Successfully parsed ${actions.length} valid actions`);
      } catch (parseError) {
        console.error("[AIService] Failed to parse actions JSON:", parseError.message);
        console.error("[AIService] Problematic JSON:", actionsJson);
        return { message: text.trim(), suggestedActions: [] };
      }

      return { message, suggestedActions: actions };
    } catch (error) {
      console.error("[AIService] Response parsing error:", error);
      return { message: text.trim(), suggestedActions: [] };
    }
  }

  /**
   * Attempt to fix common JSON formatting issues from AI responses
   */
  fixCommonJsonIssues(json) {
    let fixed = json;

    // Remove trailing commas before ] or }
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

    // Fix unquoted property names (simple cases)
    fixed = fixed.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

    // Remove any leading/trailing whitespace
    fixed = fixed.trim();

    // Ensure it starts with [ for array
    if (!fixed.startsWith('[') && fixed.startsWith('{')) {
      fixed = '[' + fixed + ']';
    }

    return fixed;
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
