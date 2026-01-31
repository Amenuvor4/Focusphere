/**
 * Confirmation Detector
 * Detects user confirmation or decline phrases for pending AI actions
 * Only triggers when there are pending actions awaiting confirmation
 */

// Patterns for detecting confirmation intent
const CONFIRMATION_PATTERNS = {
  // Strong affirmative - exact matches (highest confidence)
  strongAffirmative: [
    /^yes$/i,
    /^yeah$/i,
    /^yep$/i,
    /^yup$/i,
    /^sure$/i,
    /^ok$/i,
    /^okay$/i,
    /^confirm$/i,
    /^confirmed$/i,
    /^approve$/i,
    /^approved$/i,
    /^accept$/i,
    /^accepted$/i,
  ],

  // Action phrases - exact or near-exact matches
  actionPhrases: [
    /^go ahead$/i,
    /^do it$/i,
    /^proceed$/i,
    /^execute$/i,
    /^run it$/i,
    /^make it happen$/i,
    /^let's do it$/i,
    /^lets do it$/i,
    /^sounds good$/i,
    /^perfect$/i,
    /^great$/i,
    /^that's fine$/i,
    /^thats fine$/i,
    /^fine$/i,
    /^alright$/i,
    /^all right$/i,
  ],

  // Decline patterns - exact matches
  decline: [
    /^no$/i,
    /^nope$/i,
    /^nah$/i,
    /^cancel$/i,
    /^stop$/i,
    /^don't$/i,
    /^dont$/i,
    /^never mind$/i,
    /^nevermind$/i,
    /^decline$/i,
    /^reject$/i,
    /^skip$/i,
    /^abort$/i,
    /^forget it$/i,
    /^no thanks$/i,
    /^no thank you$/i,
  ],

  // Contextual patterns - require more context
  contextual: {
    affirmative: [
      /^yes,?\s*(please|do it|go ahead)?$/i,
      /^yeah,?\s*(sure|do it|go ahead)?$/i,
      /^sure,?\s*(thing|go ahead)?$/i,
      /^ok,?\s*(do it|go ahead|sounds good)?$/i,
    ],
    decline: [/^no,?\s*(thanks|don't|cancel)?$/i, /^not?\s*(now|yet|today)$/i],
  },
};

/**
 * Detect if a message is a confirmation, decline, or neither
 * @param {string} message - User's message
 * @param {boolean} hasPendingActions - Whether user has pending actions
 * @returns {Object} - { type: 'confirm'|'decline'|'none', confidence: 0-1 }
 */
function detectConfirmation(message, hasPendingActions = false) {
  // Default response when no pending actions
  if (!hasPendingActions) {
    return { type: "none", confidence: 0, reason: "no_pending_actions" };
  }

  if (!message || typeof message !== "string") {
    return { type: "none", confidence: 0, reason: "invalid_message" };
  }

  // Normalize the message
  const normalizedMessage = message.trim().toLowerCase();

  // Skip if message is too long (likely a new request, not a confirmation)
  if (normalizedMessage.length > 50) {
    return { type: "none", confidence: 0, reason: "message_too_long" };
  }

  // Check strong affirmative patterns (highest priority)
  for (const pattern of CONFIRMATION_PATTERNS.strongAffirmative) {
    if (pattern.test(normalizedMessage)) {
      console.log(
        `[ConfirmationDetector] Strong affirmative match: "${normalizedMessage}"`,
      );
      return {
        type: "confirm",
        confidence: 1.0,
        pattern: "strong_affirmative",
      };
    }
  }

  // Check action phrases
  for (const pattern of CONFIRMATION_PATTERNS.actionPhrases) {
    if (pattern.test(normalizedMessage)) {
      console.log(
        `[ConfirmationDetector] Action phrase match: "${normalizedMessage}"`,
      );
      return { type: "confirm", confidence: 1.0, pattern: "action_phrase" };
    }
  }

  // Check decline patterns
  for (const pattern of CONFIRMATION_PATTERNS.decline) {
    if (pattern.test(normalizedMessage)) {
      console.log(
        `[ConfirmationDetector] Decline match: "${normalizedMessage}"`,
      );
      return { type: "decline", confidence: 1.0, pattern: "decline" };
    }
  }

  // Check contextual affirmative patterns
  for (const pattern of CONFIRMATION_PATTERNS.contextual.affirmative) {
    if (pattern.test(normalizedMessage)) {
      console.log(
        `[ConfirmationDetector] Contextual affirmative match: "${normalizedMessage}"`,
      );
      return {
        type: "confirm",
        confidence: 0.9,
        pattern: "contextual_affirmative",
      };
    }
  }

  // Check contextual decline patterns
  for (const pattern of CONFIRMATION_PATTERNS.contextual.decline) {
    if (pattern.test(normalizedMessage)) {
      console.log(
        `[ConfirmationDetector] Contextual decline match: "${normalizedMessage}"`,
      );
      return {
        type: "decline",
        confidence: 0.9,
        pattern: "contextual_decline",
      };
    }
  }

  // Partial word matching for short messages (3 words or less)
  const words = normalizedMessage.split(/\s+/);
  if (words.length <= 3) {
    // Check if any word is a clear affirmative
    const affirmativeWords = [
      "yes",
      "yeah",
      "yep",
      "yup",
      "sure",
      "ok",
      "okay",
      "confirm",
      "proceed",
      "approved",
    ];
    const declineWords = [
      "no",
      "nope",
      "nah",
      "cancel",
      "stop",
      "decline",
      "reject",
    ];

    for (const word of words) {
      if (affirmativeWords.includes(word)) {
        console.log(
          `[ConfirmationDetector] Partial affirmative word found: "${word}" in "${normalizedMessage}"`,
        );
        return { type: "confirm", confidence: 0.8, pattern: "partial_word" };
      }
      if (declineWords.includes(word)) {
        console.log(
          `[ConfirmationDetector] Partial decline word found: "${word}" in "${normalizedMessage}"`,
        );
        return { type: "decline", confidence: 0.8, pattern: "partial_word" };
      }
    }
  }

  // No match found
  return { type: "none", confidence: 0, reason: "no_match" };
}

/**
 * Check if a message looks like it might be requesting new actions
 * rather than confirming existing ones
 * @param {string} message - User's message
 * @returns {boolean}
 */
function isLikelyNewRequest(message) {
  if (!message) return false;

  const normalized = message.trim().toLowerCase();

  // Check for action verbs that suggest new requests
  const actionIndicators = [
    /^(create|add|make|delete|remove|update|change|set|move|schedule)/i,
    /^(help me|can you|please|i want|i need|show me|list|find)/i,
    /\?$/, // Questions are usually new requests
  ];

  for (const indicator of actionIndicators) {
    if (indicator.test(normalized)) {
      return true;
    }
  }

  return false;
}

/**
 * Get a user-friendly description of pending actions
 * @param {Array} actions - Array of pending actions
 * @returns {string}
 */
function describePendingActions(actions) {
  if (!actions || actions.length === 0) {
    return "No pending actions";
  }

  const actionCounts = {};
  for (const action of actions) {
    const type = action.type.replace("_", " ");
    actionCounts[type] = (actionCounts[type] || 0) + 1;
  }

  const descriptions = Object.entries(actionCounts).map(
    ([type, count]) => `${count} ${type}${count > 1 ? "s" : ""}`,
  );

  return descriptions.join(", ");
}

module.exports = {
  detectConfirmation,
  isLikelyNewRequest,
  describePendingActions,
  CONFIRMATION_PATTERNS,
};
