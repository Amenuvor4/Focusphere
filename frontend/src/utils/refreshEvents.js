/**
 * Event system for triggering data refresh across components
 * Used when AI actions modify tasks/goals to keep UI in sync
 */

export const REFRESH_TASKS_EVENT = 'focusphere:refreshTasks';
export const REFRESH_GOALS_EVENT = 'focusphere:refreshGoals';

/**
 * Emit event to refresh tasks in TaskList and other components
 */
export const emitRefreshTasks = () => {
  window.dispatchEvent(new CustomEvent(REFRESH_TASKS_EVENT));
};

/**
 * Emit event to refresh goals in GoalList and other components
 */
export const emitRefreshGoals = () => {
  window.dispatchEvent(new CustomEvent(REFRESH_GOALS_EVENT));
};

/**
 * Emit events to refresh both tasks and goals
 */
export const emitRefreshAll = () => {
  emitRefreshTasks();
  emitRefreshGoals();
};
