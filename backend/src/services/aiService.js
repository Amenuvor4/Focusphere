const { GoogleGenerativeAI } = require("@google/generative-ai");

// Mock responses for development/testing without API calls
const MOCK_RESPONSES = {
  default: {
    message: "I'm running in mock mode. This is a simulated response for testing the UI without using API quota.",
    suggestedActions: []
  },
  createTask: {
    message: "I'll create that task for you.",
    suggestedActions: [{
      type: "create_task",
      data: {
        title: "Mock Task",
        category: "Work",
        priority: "medium",
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    }]
  }
};

// Model configurations with quotas and capabilities
const MODEL_CONFIG = {
  'gemini-1.5-flash': {
    name: 'gemini-1.5-flash',
    displayName: 'Gemini 1.5 Flash',
    tier: 'fast',
    rpmLimit: 15,
    tpmLimit: 1000000,
    dailyLimit: 1500,
  },
  'gemini-2.0-flash': {
    name: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    tier: 'smart',
    rpmLimit: 10,
    tpmLimit: 4000000,
    dailyLimit: 1000,
  },
  'gemini-1.5-pro': {
    name: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    tier: 'pro',
    rpmLimit: 2,
    tpmLimit: 32000,
    dailyLimit: 50,
  }
};

// Map user-facing model names to actual API model names
const MODEL_NAME_MAP = {
  'gemini-1.5-flash': 'gemini-1.5-flash',
  'gemini-2.0-flash': 'gemini-2.0-flash',
  'gemini-1.5-pro': 'gemini-1.5-pro'
};

// Failover order: try user's choice, then cycle through alternatives
const FAILOVER_ORDER = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

// System instruction for the AI
const SYSTEM_INSTRUCTION = `You are Focusphere AI, a high-intelligence productivity strategist.

## PERSPECTIVE: The Virtual COO
You don't just manage tasks; you manage success. Your goal is to identify patterns in [HISTORY], [STATS], and [CATEGORY_TRENDS] to proactively suggest improvements. You act as a coach who understands the user's workload, energy levels, and long-term ambitions.

## CORE PRINCIPLE: Strategic, Proactive, Human
You understand context, break down complex goals into actionable sub-tasks, and help users achieve success. Be professional, insightful, and encouraging. Use phrases like "Based on your recent progress..." or "I noticed a pattern in your workflow..."

## ADVANCED COGNITION: INFERENCE & ANALYTICS

1. **Historical Inference**
   - Analyze [HISTORY] for user habits and friction points
   - If user frequently defers a category, suggest breaking those tasks into smaller 15-min sub-tasks
   - Example: "I notice you often reschedule Financial tasks. Want me to break 'Tax Prep' into smaller steps?"

2. **Predictive Analytics & Burn-out Detection**
   - Check [STATS] and [WORKLOAD_LEVEL] before accepting new tasks
   - If WORKLOAD_LEVEL is HEAVY or CRITICAL, prioritize clearing backlog first
   - If completionRate < 50%, suggest "scope cutting" (defer/delete low-priority items)
   - Example: "Your backlog is growing. Before adding more, should we clear these 3 overdue items first?"

3. **Strategic Decomposition**
   - For ambitious goals, suggest a 3-phase roadmap: (1) Research/Setup, (2) Execution, (3) Optimization
   - Use general knowledge to break goals into realistic milestones

4. **Cognitive Load Optimization**
   - Suggest task timing based on [SYSTEM_TIME]:
     - Morning (before 12pm): Deep focus work, complex tasks
     - Afternoon (12pm-5pm): Meetings, collaborative work, admin
     - Evening (after 5pm): Light tasks, planning for tomorrow
   - Tag task suggestions with cognitive prefixes when helpful

## TASK PREFIX SYSTEM (Optional Enhancement)
When suggesting tasks, you MAY use these prefixes to indicate cognitive load:
- [DEEP WORK] - Complex, focused tasks (coding, writing, analysis)
- [SHALLOW] - Quick administrative tasks (emails, scheduling)
- [RECOVERY] - Light tasks for low-energy periods
- [BUFFER] - Time between complex tasks for decompression

## PROACTIVE BEHAVIORS

1. **Buffer Task Suggestions**
   - After complex goals/tasks, suggest buffer or review tasks
   - Example: "I'll also add a 'Review Progress' task after your presentation"

2. **Workload Warnings**
   - If user has 5+ high-priority tasks in 48 hours, warn about overload
   - Suggest "Strategic Deferral" to protect mental bandwidth
   - Example: "You have 6 high-priority items this week. Want me to defer 2 to next week?"

3. **Pattern Recognition**
   - Use [CATEGORY_TRENDS] to identify neglected areas
   - If a category has many incomplete tasks, proactively address it
   - Example: "Your Health tasks have been piling up. Should we prioritize one today?"

## CRITICAL: DETAIL GATHERING BEFORE ACTIONS

Before creating ANY task or goal, you MUST gather essential details. DO NOT generate <ACTIONS> tags until you have the required information.

**Required for Tasks:**
- Title (what is the task?)
- Due date (when should it be done?)
- Priority (high/medium/low) - can suggest based on context
- Category - can infer from context

**Required for Goals:**
- Title (what is the goal?)
- Deadline (when should it be achieved?)
- Priority - can suggest based on context

**Gathering Behavior:**
1. If user gives VAGUE request ("create a task", "help me set a goal"):
   → Ask for title AND due date/deadline at minimum
   → Example: "Sure! What would you like to call this goal, and when do you want to achieve it by?"

2. If user gives PARTIAL details ("create a task to buy groceries"):
   → Ask for missing required fields (due date, priority if unclear)
   → Example: "Got it - 'Buy groceries'. When do you need this done by?"

3. If user gives ABUNDANT details ("create a high priority task called Review Report due tomorrow"):
   → Create action card immediately for confirmation
   → Still show the action card - never execute without user approval

4. If user explicitly delegates ("just handle it", "you decide", "randomize"):
   → Use sensible defaults and create action card
   → Default due date: 2 days from now
   → Default priority: medium
   → Still show action card for confirmation

**NEVER skip confirmation** - always show an action card before executing, even with full details.

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

1. **Read the [TASKS] and [GOALS] Context First - CRITICAL**
   - ALWAYS check [TASKS] and [GOALS] sections BEFORE generating update/delete actions
   - Only items listed in these sections actually exist in the database
   - If user refers to a task/goal not in the context, it doesn't exist yet
   - Each line in [TASKS] is one task, each line in [GOALS] is one goal
   - Count them correctly before answering
   - For updates: ONLY use IDs that appear in the current [TASKS]/[GOALS] context

2. **Natural Communication**
   - Be concise but conversational
   - Acknowledge context when helpful ("I see you have a lot on your plate")
   - Use common sense for sub-task suggestions (e.g., for "build a website": suggest design, development, testing tasks)

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
- For create_task: MUST include title, category, priority, and due_date (ISO format YYYY-MM-DD)
- If no due date specified by user, default to 2 days from [SYSTEM_TIME]
- Always use [SYSTEM_TIME] for relative date calculations

## CALENDAR AWARENESS
When a task has a specific time component (meetings, appointments, deadlines with times), include a sync_calendar_event action alongside the create_task action.

**When to sync to calendar:**
- Meetings: "Meeting with John at 3 PM" → sync to calendar
- Appointments: "Doctor appointment tomorrow at 10am" → sync to calendar
- Time-specific tasks: "Call client at 2:30 PM" → sync to calendar
- Deadlines with times: "Submit report by 5 PM Friday" → sync to calendar

**When NOT to sync:**
- General tasks without times: "Buy groceries" → no calendar sync
- Ongoing tasks: "Work on project" → no calendar sync
- Tasks with only dates (no time): "Finish report by Friday" → no calendar sync

**sync_calendar_event format:**
{"type":"sync_calendar_event","data":{"taskId":"<task_id>","startDateTime":"<ISO_datetime>"}}

Note: For new tasks, use "pending" as taskId - the system will link it after task creation.
Example with time: User says "Schedule meeting with team tomorrow at 2pm"
<ACTIONS>[{"type":"create_task","data":{"title":"Team Meeting","category":"Meetings","priority":"high","due_date":"2025-02-02","description":"Team meeting"}},{"type":"sync_calendar_event","data":{"taskId":"pending","startDateTime":"2025-02-02T14:00:00"}}]</ACTIONS>

**Bulk Calendar Sync:**
If user asks to "sync all tasks to calendar", "put everything on my calendar", or "sync my schedule":
<ACTIONS>[{"type":"sync_bulk_calendar","data":{}}]</ACTIONS>
This syncs all unsynced tasks with due dates to Google Calendar in one action.

## RESPONSE FORMAT

**For informational queries:**
- Just answer the question directly
- NO <ACTIONS> tag needed
- Count accurately from the data provided

**For action requests:**
1. Brief acknowledgment (1 sentence)
2. Actions: <ACTIONS>[{"type":"...","data":{}}]</ACTIONS>

Valid action types: create_task, update_task, delete_task, delete_all_tasks, create_goal, update_goal, delete_goal, delete_all_goals, sync_calendar_event, sync_bulk_calendar

## CRITICAL: ID REQUIREMENTS FOR EXISTING ITEMS

**NEVER HALLUCINATE IDs** - This is the #1 cause of action failures.

When referencing EXISTING tasks or goals (for update/delete operations):
1. ALWAYS extract the EXACT 24-character ID from the [TASKS] or [GOALS] context
2. Context format: ID:{taskId}|T:{title}|S:{status}|P:{priority}|C:{category}|D:{dueDate}
3. For update_task: MUST include "taskId": "<exact_24_char_id>"
4. For delete_task: MUST include "taskId": "<exact_24_char_id>"
5. For update_goal: MUST include "goalId": "<exact_24_char_id>"
6. For delete_goal: MUST include "goalId": "<exact_24_char_id>"

**ABSOLUTE RULES:**
- NEVER use placeholder IDs like "TASK_ID_1", "task_123", "goal_abc"
- ONLY use exact 24-character hexadecimal IDs from [TASKS]/[GOALS] context
- If an item is NOT in the current [TASKS] or [GOALS] list, you CANNOT update/delete it
- If user refers to a task you just suggested creating but hasn't been approved yet, tell them: "That task hasn't been created yet. Please approve the pending action first, then I can update it."

CORRECT format (updating "Buy Milk" task with ID 507f1f77bcf86cd799439011):
<ACTIONS>[{"type":"update_task","data":{"taskId":"507f1f77bcf86cd799439011","updates":{"status":"completed"}}}]</ACTIONS>

INCORRECT (will fail - placeholder ID):
<ACTIONS>[{"type":"update_task","data":{"taskId":"TASK_ID_1","updates":{"status":"completed"}}}]</ACTIONS>

INCORRECT (will fail - missing ID):
<ACTIONS>[{"type":"update_task","data":{"title":"Buy Milk","updates":{"status":"completed"}}}]</ACTIONS>

Process for "mark X as done" or similar requests:
1. Search [TASKS] context for a task matching the title/description
2. If FOUND: Extract the exact 24-character ID from "ID:{id}" at the start of that line
3. If NOT FOUND: Tell user the task isn't in your current context - they may need to refresh or the task hasn't been created yet
4. Include the exact ID as taskId (or goalId for goals) in your action JSON

## CRITICAL: ACTION TAG FORMAT
ONLY include <ACTIONS> tags when the user explicitly wants to CREATE, UPDATE, or DELETE something.
Do NOT include actions for questions like "how many", "show me", "what is", "list my", etc.
The JSON inside MUST be valid - no trailing commas, all strings quoted.

CORRECT format:
<ACTIONS>[{"type":"create_task","data":{"title":"Task name","category":"Work","priority":"high","due_date":"2025-02-01"}}]</ACTIONS>

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
- Warn clearly: "This will permanently delete ALL your tasks/goals. This cannot be undone. Are you sure?"
- Do NOT state specific counts in warnings (the system will report accurate counts after execution)
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
When request is unclear or missing required details:
- Ask for the missing essential fields (title + due date/deadline)
- Combine questions when possible: "What's the task and when is it due?"
- If user provides title but no date, ask just for the date
- Don't ask about optional fields (category can be inferred, priority defaults to medium)
- Never generate actions without required details unless user explicitly delegates

### Time/Date Logic
- Calculate actual ISO dates from relative terms
- "tomorrow" = [SYSTEM_TIME] + 1 day
- "next Tuesday" = calculate from [SYSTEM_TIME]
- "in 2 hours" = calculate exact time

### Off-Topic Requests
For non-productivity questions:
- Use general knowledge briefly if helpful, then redirect
- Example: "Good question! [brief answer]. Now, you have 2 overdue tasks - want to tackle those?"

### Goal Decomposition (Smart Breakdown)
When user sets ambitious goals ("run a marathon", "learn web development", "launch my startup"):
1. First, confirm the goal details (title, deadline) if not provided
2. Then offer to break it into milestone sub-tasks using common sense:
   - "Learn Web Dev" → HTML/CSS basics, JavaScript, Framework, Build Project
   - "Run Marathon" → Build base mileage, Long runs, Speed work, Taper
   - "Launch SaaS" → MVP features, Payment integration, Marketing, Launch prep
3. Suggest realistic timelines based on complexity
4. Create a structured action plan with the goal + related tasks
5. Always show action cards for user approval before creating anything

Remember: Be strategic, proactive, and human. Analyze patterns before acting. Protect the user's bandwidth. NEVER hallucinate IDs - only use exact IDs from context.`;

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.isMockMode = process.env.MOCK_AI === 'true';
    this.models = {};
    this.currentModelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    // Rate limit tracking
    this.rateLimitState = {
      retryAfter: null,
      retryAfterTimestamp: null,
      failedModel: null,
      lastError: null
    };

    // Token usage tracking (per session, resets on server restart)
    this.tokenUsage = {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      requestCount: 0,
      lastReset: new Date(),
      estimatedRemaining: 1500 // Rough estimate based on free tier
    };

    if (this.isMockMode) {
      console.log(`[AIService] 🧪 MOCK MODE ENABLED - No API calls will be made`);
      return;
    }

    // Initialize primary model
    this.initializeModel(this.currentModelName);
    console.log(`[AIService] Initialized with primary model: ${this.currentModelName}`);
  }

  /**
   * Initialize a model with the system instruction
   */
  initializeModel(modelName) {
    if (!this.models[modelName]) {
      // Map user-facing name to actual API model name
      const apiModelName = MODEL_NAME_MAP[modelName] || modelName;
      this.models[modelName] = this.genAI.getGenerativeModel({
        model: apiModelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      });
      console.log(`[AIService] Model ${modelName} (API: ${apiModelName}) initialized`);
    }
    return this.models[modelName];
  }

  /**
   * Get the current active model (or initialize it)
   */
  getModel(modelName = null) {
    const name = modelName || this.currentModelName;
    if (!this.models[name]) {
      this.initializeModel(name);
    }
    return this.models[name];
  }

  /**
   * Check if error should trigger failover to next model
   */
  isFailoverError(error) {
    const message = error?.message || '';
    const status = error?.status;

    // 429 = Rate limit, 404 = Model not found, 503 = Service unavailable
    if (status === 429 || status === 404 || status === 503) return true;
    if (message.includes('429') || message.includes('Resource has been exhausted')) return true;
    if (message.includes('404') || message.includes('not found')) return true;
    if (message.includes('503') || message.includes('unavailable')) return true;

    return false;
  }

  /**
   * Extract rate limit info from Google API error
   */
  extractRateLimitInfo(error) {
    const info = {
      isRateLimit: false,
      isModelNotFound: false,
      retryAfterSeconds: null,
      quotaMetric: null,
      model: null
    };

    const message = error?.message || '';
    const status = error?.status;

    // Check for 404 model not found
    if (status === 404 || message.includes('404') || message.includes('not found')) {
      info.isModelNotFound = true;
      return info;
    }

    if (message.includes('429') || status === 429) {
      info.isRateLimit = true;

      // Try to extract retry delay from error details
      if (error.errorDetails) {
        for (const detail of error.errorDetails) {
          if (detail['@type']?.includes('RetryInfo')) {
            const retryDelay = detail.retryDelay;
            if (retryDelay) {
              // Parse "42s" or "42.5s" format
              const seconds = parseFloat(retryDelay.replace('s', ''));
              info.retryAfterSeconds = Math.ceil(seconds);
            }
          }
          if (detail['@type']?.includes('QuotaFailure')) {
            const violation = detail.violations?.[0];
            if (violation) {
              info.quotaMetric = violation.quotaMetric;
              info.model = violation.quotaDimensions?.model;
            }
          }
        }
      }

      // Fallback: try to parse from error message
      if (!info.retryAfterSeconds) {
        const retryMatch = message.match(/retry in (\d+(?:\.\d+)?)/i);
        if (retryMatch) {
          info.retryAfterSeconds = Math.ceil(parseFloat(retryMatch[1]));
        }
      }
    }

    return info;
  }

  /**
   * Main chat method with failover support
   */
  async chat(message, context, options = {}) {
    const { preferredModel } = options;

    // Handle mock mode
    if (this.isMockMode) {
      console.log('[AIService] Mock mode - returning simulated response');
      return this.getMockResponse(message);
    }

    const {
      tasks,
      goals,
      conversationHistory = [],
      analytics,
      imageData,
    } = context;

    // Build the context string
    const userContext = this.buildContext(message, tasks, goals, conversationHistory, analytics);

    // Determine which model to try first
    const modelToTry = preferredModel || this.currentModelName;
    const modelsToAttempt = [modelToTry, ...FAILOVER_ORDER.filter(m => m !== modelToTry)];

    let lastError = null;
    let rateLimitInfo = null;

    // Try each model in order until one succeeds
    for (const modelName of modelsToAttempt) {
      try {
        console.log(`[AIService] Attempting request with model: ${modelName}`);
        const model = this.getModel(modelName);

        let result;
        if (imageData) {
          const imagePart = {
            inlineData: {
              data: imageData.split(",")[1],
              mimeType: imageData.match(/data:([^;]+);/)[1],
            },
          };
          result = await model.generateContent([userContext, imagePart]);
        } else {
          result = await model.generateContent(userContext);
        }

        const responseText = result.response.text();

        // Update token usage tracking (estimate)
        this.updateTokenUsage(userContext, responseText);

        // Update current model on success
        if (modelName !== this.currentModelName) {
          console.log(`[AIService] Switched to model: ${modelName}`);
          this.currentModelName = modelName;
        }

        // Clear rate limit state on success
        this.rateLimitState = {
          retryAfter: null,
          retryAfterTimestamp: null,
          failedModel: null,
          lastError: null
        };

        const parsed = this.parseResponse(responseText);
        return {
          ...parsed,
          _meta: {
            model: modelName,
            tokenUsage: this.getTokenUsageInfo()
          }
        };
      } catch (error) {
        console.error(`[AIService] Error with model ${modelName}:`, error.message);
        lastError = error;

        // Check error type for failover decision
        rateLimitInfo = this.extractRateLimitInfo(error);

        if (rateLimitInfo.isModelNotFound) {
          console.log(`[AIService] Model ${modelName} not found (404), trying next model...`);
          continue; // Silent failover to next model
        }

        if (rateLimitInfo.isRateLimit) {
          console.log(`[AIService] Rate limit hit on ${modelName}, switching to backup model...`);

          // Store rate limit state
          this.rateLimitState = {
            retryAfter: rateLimitInfo.retryAfterSeconds,
            retryAfterTimestamp: Date.now() + (rateLimitInfo.retryAfterSeconds * 1000),
            failedModel: modelName,
            lastError: error.message
          };

          // Continue to try next model (silent failover)
          continue;
        }

        // Check if it's any other failover-worthy error
        if (this.isFailoverError(error)) {
          console.log(`[AIService] Failover error on ${modelName}, trying next model...`);
          continue;
        }

        // For non-failover errors, don't try next model
        break;
      }
    }

    // All models failed
    console.error('[AIService] All models exhausted');

    // Create a detailed error with rate limit info
    const error = new Error('AI service unavailable');
    error.rateLimitInfo = rateLimitInfo;
    error.retryAfter = this.rateLimitState.retryAfter;
    error.failedModel = this.rateLimitState.failedModel;
    throw error;
  }

  /**
   * Build the context string for the AI
   */
  buildContext(message, tasks, goals, conversationHistory, analytics) {
    const now = new Date();
    const systemTime = now.toISOString();
    const today = systemTime.split("T")[0];

    // Limit task context to reduce token usage (5 most relevant tasks)
    const taskContext = tasks
      ?.slice(0, 10)
      .map((t) => {
        const dueDate = t.due_date
          ? new Date(t.due_date).toISOString().split("T")[0]
          : null;
        const isOverdue =
          dueDate && dueDate < today && t.status !== "completed";
        return `ID:${t._id}|T:${t.title}|S:${t.status}|P:${t.priority}|C:${t.category || "None"}|D:${dueDate || "None"}${isOverdue ? "|OVERDUE" : ""}`;
      })
      .join("\n") || "None";

    const goalContext = goals
      ?.slice(0, 5)
      .map((g) => {
        const deadline = g.deadline
          ? new Date(g.deadline).toISOString().split("T")[0]
          : null;
        return `ID:${g._id}|T:${g.title}|P:${g.progress}%|Pri:${g.priority || "medium"}|DL:${deadline || "None"}`;
      })
      .join("\n") || "None";

    const overdueCount = tasks?.filter((t) => {
      const dueDate = t.due_date ? new Date(t.due_date).toISOString().split("T")[0] : null;
      return dueDate && dueDate < today && t.status !== "completed";
    }).length || 0;

    const highPriorityPending = tasks?.filter(
      (t) => t.priority === "high" && t.status !== "completed"
    ).length || 0;

    const pendingCount = tasks?.filter((t) => t.status !== "completed").length || 0;

    let workloadLevel = "LIGHT";
    if (pendingCount > 15 || (highPriorityPending > 5 && overdueCount > 3)) {
      workloadLevel = "CRITICAL";
    } else if (pendingCount > 10 || highPriorityPending > 3 || overdueCount > 2) {
      workloadLevel = "HEAVY";
    } else if (pendingCount > 5) {
      workloadLevel = "MODERATE";
    }

    const hour = now.getHours();
    let timeOfDay = "MORNING";
    if (hour >= 12 && hour < 17) timeOfDay = "AFTERNOON";
    else if (hour >= 17) timeOfDay = "EVENING";

    const completionRate = analytics?.completionRate ||
      (tasks?.length > 0 ? Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100) : 0);

    // Calculate Completion Confidence score (0-100)
    // Factors: completion rate, overdue ratio, workload level
    let completionConfidence = completionRate;
    if (pendingCount > 0) {
      const overdueRatio = overdueCount / pendingCount;
      completionConfidence = Math.max(0, Math.round(completionRate - (overdueRatio * 30)));
    }
    if (workloadLevel === "CRITICAL") completionConfidence = Math.max(0, completionConfidence - 20);
    else if (workloadLevel === "HEAVY") completionConfidence = Math.max(0, completionConfidence - 10);

    // Calculate Category Affinity (which categories user focuses on)
    const categoryStats = {};
    tasks?.forEach(t => {
      const cat = t.category || "Uncategorized";
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });
    const topCategories = Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, count]) => `${cat}:${count}`)
      .join(",") || "None";

    const analyticsContext = `Overdue:${overdueCount}|HighPri:${highPriorityPending}|Pending:${pendingCount}|Rate:${completionRate}%|Confidence:${completionConfidence}%`;

    // Reduce history to last 5 messages to save tokens
    const history = conversationHistory
      .slice(-5)
      .map((msg) => `${msg.role === "user" ? "U" : "A"}: ${msg.content}`)
      .join("\n");

    return `
[SYSTEM_TIME]: ${systemTime}
[TODAY]: ${today}
[TIME_OF_DAY]: ${timeOfDay}
[WORKLOAD_LEVEL]: ${workloadLevel}
[STATS]: ${analyticsContext}
[CATEGORY_TRENDS]: ${topCategories}
[TASKS]:
${taskContext}
[GOALS]:
${goalContext}
[HISTORY]:
${history}

User Message: ${message}`;
  }

  /**
   * Get mock response for testing
   */
  getMockResponse(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('create') && lowerMessage.includes('task')) {
      return { ...MOCK_RESPONSES.createTask, _meta: { model: 'mock', isMock: true } };
    }

    return { ...MOCK_RESPONSES.default, _meta: { model: 'mock', isMock: true } };
  }

  /**
   * Update token usage estimates
   */
  updateTokenUsage(input, output) {
    // Rough estimate: ~4 chars per token
    const inputTokens = Math.ceil(input.length / 4);
    const outputTokens = Math.ceil(output.length / 4);

    this.tokenUsage.totalInputTokens += inputTokens;
    this.tokenUsage.totalOutputTokens += outputTokens;
    this.tokenUsage.requestCount++;

    // Estimate remaining requests (very rough)
    // Free tier is about 15 RPM, 1500 RPD
    this.tokenUsage.estimatedRemaining = Math.max(0, 1500 - this.tokenUsage.requestCount);
  }

  /**
   * Get token usage info for frontend
   */
  getTokenUsageInfo() {
    const remaining = this.tokenUsage.estimatedRemaining;
    let warningLevel = 'normal';

    if (remaining <= 5) {
      warningLevel = 'critical';
    } else if (remaining <= 20) {
      warningLevel = 'warning';
    }

    return {
      requestCount: this.tokenUsage.requestCount,
      estimatedRemaining: remaining,
      warningLevel,
      lastReset: this.tokenUsage.lastReset
    };
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus() {
    if (!this.rateLimitState.retryAfterTimestamp) {
      return { isLimited: false };
    }

    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((this.rateLimitState.retryAfterTimestamp - now) / 1000));

    if (remaining <= 0) {
      // Rate limit has expired
      this.rateLimitState = {
        retryAfter: null,
        retryAfterTimestamp: null,
        failedModel: null,
        lastError: null
      };
      return { isLimited: false };
    }

    return {
      isLimited: true,
      retryAfterSeconds: remaining,
      failedModel: this.rateLimitState.failedModel,
      availableModels: FAILOVER_ORDER.filter(m => m !== this.rateLimitState.failedModel)
    };
  }

  /**
   * Get available models info
   */
  getModelsInfo() {
    return {
      current: this.currentModelName,
      available: Object.keys(MODEL_CONFIG).map(key => ({
        name: key,
        ...MODEL_CONFIG[key]
      })),
      rateLimitStatus: this.getRateLimitStatus()
    };
  }

  /**
   * Parse AI response to extract actions
   */
  parseResponse(text) {
    try {
      console.log('[AIService] === PARSING AI RESPONSE ===');
      console.log('[AIService] Raw response length:', text?.length);

      const actionsMatch = text.match(/<ACTIONS>([\s\S]*?)<\/ACTIONS>/);

      if (!actionsMatch) {
        const actionKeywords = /\b(creat|delet|updat|add|remov)\w*/i;
        if (actionKeywords.test(text)) {
          console.log('[AIService] WARNING: Response mentions actions but no <ACTIONS> tags found');
        }
        return { message: text.trim(), suggestedActions: [] };
      }

      const message = text.replace(/<ACTIONS>[\s\S]*?<\/ACTIONS>/g, "").trim();
      let actionsJson = actionsMatch[1].trim();
      let actions = [];

      console.log('[AIService] Found ACTIONS tag, JSON content:', actionsJson.substring(0, 500));

      try {
        actionsJson = this.fixCommonJsonIssues(actionsJson);
        actions = JSON.parse(actionsJson);

        if (!Array.isArray(actions)) {
          actions = [actions];
        }

        const validTypes = [
          "create_task", "update_task", "delete_task", "delete_all_tasks",
          "create_goal", "update_goal", "delete_goal", "delete_all_goals",
          "sync_calendar_event", "sync_bulk_calendar",
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
        return { message: text.trim(), suggestedActions: [] };
      }

      return { message, suggestedActions: actions };
    } catch (error) {
      console.error("[AIService] Response parsing error:", error);
      return { message: text.trim(), suggestedActions: [] };
    }
  }

  /**
   * Fix common JSON formatting issues
   */
  fixCommonJsonIssues(json) {
    let fixed = json;
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    fixed = fixed.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
    fixed = fixed.trim();
    if (!fixed.startsWith('[') && fixed.startsWith('{')) {
      fixed = '[' + fixed + ']';
    }
    return fixed;
  }

  /**
   * Generate chat title
   */
  async generateChatTitle(userMessage, aiResponse = null) {
    if (this.isMockMode) {
      return "Mock Conversation";
    }

    let context = `User: "${userMessage}"`;
    if (aiResponse) {
      context += `\nAI Response: "${aiResponse.slice(0, 100)}..."`;
    }

    const prompt = `Generate a concise, descriptive title (3-5 words) for this conversation:

${context}

Rules:
- Maximum 5 words
- Be specific about the topic
- No quotes in output
- Title case

Title:`;

    try {
      const model = this.getModel();
      const result = await model.generateContent(prompt);
      const title = result.response.text().trim();
      const cleanTitle = title
        .replace(/^["']|["']$/g, "")
        .replace(/^\*+|\*+$/g, "")
        .replace(/^#+\s*/, "")
        .trim();
      return cleanTitle.slice(0, 50);
    } catch (error) {
      console.error("Title generation error:", error);
      const words = userMessage.split(" ").filter((w) => w.length > 2);
      return words.slice(0, 4).join(" ");
    }
  }

  getDefaultDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split("T")[0];
  }
}

module.exports = new AIService();
