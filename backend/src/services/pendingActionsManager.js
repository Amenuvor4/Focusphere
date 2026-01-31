/**
 * Pending Actions Manager
 * In-memory storage for AI-suggested actions awaiting user confirmation
 * Uses Map with userId as key for O(1) lookup
 */

class PendingActionsManager {
  constructor() {
    this.store = new Map();
    this.TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Periodic cleanup of expired entries
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000); // Every minute
  }

  /**
   * Store pending actions for a user
   * @param {string} userId - User ID
   * @param {Array} actions - Array of action objects
   * @param {string} conversationId - Optional conversation ID for context
   */
  set(userId, actions, conversationId = null) {
    if (!userId || !actions || !Array.isArray(actions) || actions.length === 0) {
      console.log('[PendingActionsManager] Invalid set request:', { userId, actionsCount: actions?.length });
      return false;
    }

    this.store.set(userId, {
      actions,
      conversationId,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.TTL,
    });

    console.log(`[PendingActionsManager] Stored ${actions.length} pending actions for user ${userId}`);
    return true;
  }

  /**
   * Get pending actions for a user
   * @param {string} userId - User ID
   * @returns {Object|null} - Pending entry or null if not found/expired
   */
  get(userId) {
    const entry = this.store.get(userId);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      console.log(`[PendingActionsManager] Entry expired for user ${userId}`);
      this.store.delete(userId);
      return null;
    }

    return entry;
  }

  /**
   * Get just the actions array for a user
   * @param {string} userId - User ID
   * @returns {Array} - Array of pending actions or empty array
   */
  getActions(userId) {
    const entry = this.get(userId);
    return entry?.actions || [];
  }

  /**
   * Clear pending actions for a user
   * @param {string} userId - User ID
   */
  clear(userId) {
    const had = this.store.has(userId);
    this.store.delete(userId);
    if (had) {
      console.log(`[PendingActionsManager] Cleared pending actions for user ${userId}`);
    }
    return had;
  }

  /**
   * Check if a user has pending actions
   * @param {string} userId - User ID
   * @returns {boolean}
   */
  hasPending(userId) {
    return this.get(userId) !== null;
  }

  /**
   * Get count of pending actions for a user
   * @param {string} userId - User ID
   * @returns {number}
   */
  getCount(userId) {
    const entry = this.get(userId);
    return entry?.actions?.length || 0;
  }

  /**
   * Update the expiration time (extend TTL) for a user's pending actions
   * Useful when user is actively interacting
   * @param {string} userId - User ID
   */
  touch(userId) {
    const entry = this.store.get(userId);
    if (entry) {
      entry.expiresAt = Date.now() + this.TTL;
      entry.timestamp = Date.now();
    }
  }

  /**
   * Get metadata about pending actions (without the actions themselves)
   * @param {string} userId - User ID
   * @returns {Object|null}
   */
  getMetadata(userId) {
    const entry = this.get(userId);
    if (!entry) return null;

    return {
      count: entry.actions.length,
      conversationId: entry.conversationId,
      timestamp: entry.timestamp,
      expiresAt: entry.expiresAt,
      timeRemaining: entry.expiresAt - Date.now(),
      actionTypes: entry.actions.map(a => a.type),
    };
  }

  /**
   * Cleanup expired entries
   * Called periodically to prevent memory leaks
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [userId, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(userId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[PendingActionsManager] Cleaned up ${cleaned} expired entries`);
    }
  }

  /**
   * Get stats about the store (for debugging/monitoring)
   */
  getStats() {
    return {
      totalEntries: this.store.size,
      ttlMinutes: this.TTL / 60000,
    };
  }

  /**
   * Stop the cleanup interval (for graceful shutdown)
   */
  shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Export singleton instance
module.exports = new PendingActionsManager();
