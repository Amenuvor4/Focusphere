const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    PROFILE: `${BASE_URL}/auth/profile`,
    GOOGLE: `${BASE_URL}/auth/google`,
    REFRESH_TOKEN: `${BASE_URL}/auth/refresh-token`,
  },
  TASKS: {
    BASE: `${BASE_URL}/tasks`,
    BY_ID: (id) => `${BASE_URL}/tasks/${id}`,
    ANALYTICS: `${BASE_URL}/tasks/analytics`,
    PRIORITIZE: `${BASE_URL}/ai/prioritize`,
  },
  GOALS: {
    BASE: `${BASE_URL}/goals`,
    BY_ID: (id) => `${BASE_URL}/goals/${id}`,
  },
  AI: {
    CHAT: `${BASE_URL}/ai/chat`,
    ANALYZE: `${BASE_URL}/ai/analyze`,
    SMART_SUGGESTIONS: `${BASE_URL}/ai/smart-suggestions`,
    EXECUTE_ACTIONS: `${BASE_URL}/ai/execute-actions`,
    PENDING_ACTIONS: `${BASE_URL}/ai/pending-actions`,
    MODELS: `${BASE_URL}/ai/models`,
    RATE_LIMIT_STATUS: `${BASE_URL}/ai/rate-limit-status`,
  },
};
