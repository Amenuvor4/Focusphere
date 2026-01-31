/**
 * Shared action execution service for AI-suggested actions
 * Used by AIAssistant and AIChatWidget to avoid code duplication
 */
import { ENDPOINTS } from '../config/api';
import { emitRefreshTasks, emitRefreshGoals, emitRefreshAll } from '../utils/refreshEvents';

export const executeAction = async (action, token) => {
  try {
    const response = await fetch(ENDPOINTS.AI.EXECUTE_ACTIONS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ actions: [action] }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Action failed');
    }

    const result = await response.json();

    // Auto-refresh based on action type
    if (result.results?.[0]?.success) {
      if (action.type.includes('task')) {
        emitRefreshTasks();
      }
      if (action.type.includes('goal')) {
        emitRefreshGoals();
      }
    }

    return result.results?.[0] || { success: result.success };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Execute multiple actions and emit refresh events on success
 * @param {Array} actions - Array of actions to execute
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Execution results with summary
 */
export const executeActions = async (actions, token) => {
  try {
    const response = await fetch(ENDPOINTS.AI.EXECUTE_ACTIONS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ actions }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Actions failed');
    }

    const result = await response.json();

    // Auto-refresh for all successful actions
    if (result.summary?.succeeded > 0) {
      const hasTaskActions = actions.some(a => a.type.includes('task'));
      const hasGoalActions = actions.some(a => a.type.includes('goal'));

      if (hasTaskActions && hasGoalActions) {
        emitRefreshAll();
      } else if (hasTaskActions) {
        emitRefreshTasks();
      } else if (hasGoalActions) {
        emitRefreshGoals();
      }
    }

    return result;
  } catch (error) {
    return { success: false, error: error.message, results: [] };
  }
};
