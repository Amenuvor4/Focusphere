/**
 * Action Executor Service
 * Validates and executes AI-suggested actions directly against the database
 */
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const User = require('../models/User');
const calendarService = require('./calendarService');

class ActionExecutor {
  constructor() {
    this.validActionTypes = [
      'create_task',
      'update_task',
      'delete_task',
      'delete_all_tasks',
      'create_goal',
      'update_goal',
      'delete_goal',
      'delete_all_goals',
      'sync_calendar_event',
      'sync_bulk_calendar',
    ];

    this.requiredFields = {
      create_task: ['title', 'category'],
      update_task: ['taskId'],
      delete_task: ['taskId'],
      delete_all_tasks: [],
      create_goal: ['title'],
      update_goal: ['goalId'],
      delete_goal: ['goalId'],
      delete_all_goals: [],
      sync_calendar_event: ['taskId'],
      sync_bulk_calendar: [],
    };
  }

  /**
   * Validate action structure before execution
   */
  validateAction(action) {
    if (!action || typeof action !== 'object') {
      return { valid: false, error: 'Invalid action object' };
    }

    if (!action.type || !this.validActionTypes.includes(action.type)) {
      return { valid: false, error: `Invalid action type: ${action.type}` };
    }

    if (!action.data || typeof action.data !== 'object') {
      return { valid: false, error: 'Missing action data' };
    }

    const required = this.requiredFields[action.type];
    for (const field of required) {
      if (!action.data[field] && !action.data.updates?.[field]) {
        // For update actions, check if taskId/goalId exists at root level
        if ((field === 'taskId' || field === 'goalId') && action.data[field]) {
          continue;
        }
        return { valid: false, error: `Missing required field: ${field}` };
      }
    }

    return { valid: true };
  }

  /**
   * Execute a single action
   */
  async execute(action, userId) {
    const validation = this.validateAction(action);
    if (!validation.valid) {
      console.log(`[ActionExecutor] Validation failed for action:`, action.type, validation.error);
      return {
        success: false,
        actionType: action.type,
        error: validation.error,
        timestamp: new Date(),
      };
    }

    try {
      let result;
      switch (action.type) {
        case 'create_task':
          result = await this.createTask(action.data, userId);
          break;
        case 'update_task':
          result = await this.updateTask(action.data, userId);
          break;
        case 'delete_task':
          result = await this.deleteTask(action.data, userId);
          break;
        case 'delete_all_tasks':
          result = await this.deleteAllTasks(userId);
          break;
        case 'create_goal':
          result = await this.createGoal(action.data, userId);
          break;
        case 'update_goal':
          result = await this.updateGoal(action.data, userId);
          break;
        case 'delete_goal':
          result = await this.deleteGoal(action.data, userId);
          break;
        case 'delete_all_goals':
          result = await this.deleteAllGoals(userId);
          break;
        case 'sync_calendar_event':
          result = await this.syncCalendarEvent(action.data, userId);
          break;
        case 'sync_bulk_calendar':
          result = await this.syncBulkCalendar(userId);
          break;
        default:
          return {
            success: false,
            actionType: action.type,
            error: 'Unknown action type',
            timestamp: new Date(),
          };
      }

      console.log(`[ActionExecutor] Action ${action.type} executed successfully:`, result);
      return {
        success: true,
        actionType: action.type,
        data: result,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`[ActionExecutor] Action ${action.type} failed:`, error.message);
      return {
        success: false,
        actionType: action.type,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Execute multiple actions with partial failure support
   */
  async executeBulk(actions, userId) {
    console.log(`[ActionExecutor] Executing ${actions.length} actions for user ${userId}`);

    const results = [];
    let lastCreatedTaskId = null;

    for (const action of actions) {
      // Handle pending taskId for calendar sync (links to just-created task)
      if (action.type === 'sync_calendar_event' && action.data.taskId === 'pending') {
        if (lastCreatedTaskId) {
          action.data.taskId = lastCreatedTaskId;
          console.log(`[ActionExecutor] Linked calendar sync to newly created task: ${lastCreatedTaskId}`);
        } else {
          console.log(`[ActionExecutor] Warning: sync_calendar_event has pending taskId but no task was created`);
          results.push({
            success: false,
            actionType: action.type,
            error: 'No task was created to sync to calendar',
            timestamp: new Date(),
          });
          continue;
        }
      }

      const result = await this.execute(action, userId);
      results.push(result);

      // Track last created task ID for calendar sync linking
      if (action.type === 'create_task' && result.success) {
        lastCreatedTaskId = result.data.id;
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.length - successCount;

    console.log(`[ActionExecutor] Bulk execution complete: ${successCount}/${results.length} succeeded`);

    return {
      results,
      summary: {
        total: results.length,
        succeeded: successCount,
        failed: failedCount,
      },
    };
  }

  /**
   * Create a new task
   */
  async createTask(data, userId) {
    const taskData = {
      user_id: userId,
      title: data.title,
      category: data.category,
      priority: data.priority || 'medium',
      status: data.status || 'todo',
      description: data.description || '',
    };

    // Handle due date
    if (data.due_date) {
      taskData.due_date = new Date(data.due_date);
    } else {
      // Default: 2 days from now
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 2);
      taskData.due_date = defaultDue;
    }

    const task = await Task.create(taskData);
    return {
      id: task._id.toString(),
      title: task.title,
      category: task.category,
      priority: task.priority,
      status: task.status,
    };
  }

  /**
   * Update an existing task
   */
  async updateTask(data, userId) {
    const taskId = data.taskId || data.id;
    const updates = data.updates || {};

    // Allow direct fields for backward compatibility
    if (data.title && !updates.title) updates.title = data.title;
    if (data.category && !updates.category) updates.category = data.category;
    if (data.priority && !updates.priority) updates.priority = data.priority;
    if (data.status && !updates.status) updates.status = data.status;
    if (data.due_date && !updates.due_date) updates.due_date = data.due_date;
    if (data.description && !updates.description) updates.description = data.description;

    const task = await Task.findOneAndUpdate(
      { _id: taskId, user_id: userId },
      { $set: updates },
      { new: true }
    );

    if (!task) {
      throw new Error('Task not found or unauthorized');
    }

    return {
      id: task._id.toString(),
      title: task.title,
      updatedFields: Object.keys(updates),
    };
  }

  /**
   * Delete a task
   */
  async deleteTask(data, userId) {
    const taskId = data.taskId || data.id;

    const task = await Task.findOneAndDelete({
      _id: taskId,
      user_id: userId,
    });

    if (!task) {
      throw new Error('Task not found or unauthorized');
    }

    return {
      id: task._id.toString(),
      title: task.title,
      deleted: true,
    };
  }

  /**
   * Create a new goal
   */
  async createGoal(data, userId) {
    const goalData = {
      userId: userId,
      title: data.title,
      description: data.description || `Goal: ${data.title}`,
      progress: data.progress || 0,
      priority: data.priority || 'medium',
      tasks: [],
    };

    if (data.deadline) {
      goalData.deadline = new Date(data.deadline);
    }

    const goal = await Goal.create(goalData);
    return {
      id: goal._id.toString(),
      title: goal.title,
      progress: goal.progress,
      priority: goal.priority,
    };
  }

  /**
   * Update an existing goal
   */
  async updateGoal(data, userId) {
    const goalId = data.goalId || data.id;
    const updates = data.updates || {};

    // Allow direct fields for backward compatibility
    if (data.title && !updates.title) updates.title = data.title;
    if (data.description && !updates.description) updates.description = data.description;
    if (data.priority && !updates.priority) updates.priority = data.priority;
    if (data.deadline && !updates.deadline) updates.deadline = data.deadline;
    if (data.progress !== undefined && updates.progress === undefined) updates.progress = data.progress;

    const goal = await Goal.findOneAndUpdate(
      { _id: goalId, userId: userId },
      { $set: updates },
      { new: true }
    );

    if (!goal) {
      throw new Error('Goal not found or unauthorized');
    }

    return {
      id: goal._id.toString(),
      title: goal.title,
      updatedFields: Object.keys(updates),
    };
  }

  /**
   * Delete a goal
   */
  async deleteGoal(data, userId) {
    const goalId = data.goalId || data.id;

    const goal = await Goal.findOneAndDelete({
      _id: goalId,
      userId: userId,
    });

    if (!goal) {
      throw new Error('Goal not found or unauthorized');
    }

    // Optionally delete associated tasks (matching the goalRoutes behavior)
    // Note: This is commented out to match the current behavior where tasks remain
    // await Task.deleteMany({ user_id: userId, category: goal.title });

    return {
      id: goal._id.toString(),
      title: goal.title,
      deleted: true,
    };
  }

  /**
   * Delete all tasks for a user
   */
  async deleteAllTasks(userId) {
    const result = await Task.deleteMany({ user_id: userId });

    return {
      deletedCount: result.deletedCount,
      deleted: true,
    };
  }

  /**
   * Delete all goals for a user
   */
  async deleteAllGoals(userId) {
    const result = await Goal.deleteMany({ userId: userId });

    return {
      deletedCount: result.deletedCount,
      deleted: true,
    };
  }

  /**
   * Sync a task to Google Calendar
   */
  async syncCalendarEvent(data, userId) {
    const taskId = data.taskId;

    // Get user with Google tokens
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.googleRefreshToken) {
      throw new Error('Google Calendar not connected. Please reconnect with Google to enable calendar sync.');
    }

    // Get the task to sync
    const task = await Task.findOne({ _id: taskId, user_id: userId });
    if (!task) {
      throw new Error('Task not found');
    }

    // Override due_date with specific startDateTime if provided
    if (data.startDateTime) {
      task.due_date = new Date(data.startDateTime);
    }

    // Create the calendar event
    const calendarEvent = await calendarService.createTaskEvent(user, task);

    return {
      taskId: task._id.toString(),
      taskTitle: task.title,
      calendarEventId: calendarEvent.id,
      calendarLink: calendarEvent.htmlLink,
      synced: true,
    };
  }

  /**
   * Bulk sync all tasks to Google Calendar
   */
  async syncBulkCalendar(userId) {
    // Get user with Google tokens
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.googleRefreshToken) {
      throw new Error('Google Calendar not connected. Please reconnect with Google to enable calendar sync.');
    }

    // Get all tasks for this user
    const tasks = await Task.find({ user_id: userId });

    if (tasks.length === 0) {
      return {
        message: 'No tasks to sync',
        success: 0,
        failed: 0,
        skipped: 0,
      };
    }

    // Bulk sync to calendar
    const results = await calendarService.syncAllTasks(user, tasks);

    return {
      message: `Synced ${results.success} tasks to Google Calendar`,
      success: results.success,
      failed: results.failed,
      skipped: results.skipped,
      errors: results.errors,
    };
  }

  /**
   * Format execution results for user-friendly display
   */
  formatResults(executionResult) {
    const { results, summary } = executionResult;

    if (summary.total === 0) {
      return 'No actions were executed.';
    }

    if (summary.failed === 0) {
      if (summary.total === 1) {
        const result = results[0];
        // Handle bulk delete actions
        if (result.actionType === 'delete_all_tasks') {
          return `Done! Deleted all ${result.data?.deletedCount || 0} tasks.`;
        }
        if (result.actionType === 'delete_all_goals') {
          return `Done! Deleted all ${result.data?.deletedCount || 0} goals.`;
        }
        if (result.actionType === 'sync_calendar_event') {
          return `Done! Synced "${result.data?.taskTitle || 'task'}" to your Google Calendar.`;
        }
        if (result.actionType === 'sync_bulk_calendar') {
          return `Done! ${result.data?.message || 'Calendar sync complete.'}`;
        }
        const action = result.actionType.replace('_', ' ');
        return `Done! Successfully ${action.replace('create', 'created').replace('update', 'updated').replace('delete', 'deleted')} "${result.data?.title || 'item'}".`;
      }
      // Check if results include bulk deletes
      const bulkDeletes = results.filter(r => r.actionType === 'delete_all_tasks' || r.actionType === 'delete_all_goals');
      if (bulkDeletes.length > 0) {
        const taskDelete = bulkDeletes.find(r => r.actionType === 'delete_all_tasks');
        const goalDelete = bulkDeletes.find(r => r.actionType === 'delete_all_goals');
        const parts = [];
        if (taskDelete) parts.push(`${taskDelete.data?.deletedCount || 0} tasks`);
        if (goalDelete) parts.push(`${goalDelete.data?.deletedCount || 0} goals`);
        return `Done! Deleted ${parts.join(' and ')}.`;
      }
      return `Done! Successfully completed all ${summary.total} actions.`;
    }

    if (summary.succeeded === 0) {
      return `Failed to complete any actions. ${results[0]?.error || 'Unknown error'}`;
    }

    const failedActions = results.filter(r => !r.success);
    return `Completed ${summary.succeeded} of ${summary.total} actions. ${summary.failed} failed: ${failedActions.map(f => f.error).join(', ')}`;
  }
}

module.exports = new ActionExecutor();
