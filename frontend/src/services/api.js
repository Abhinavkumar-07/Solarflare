export const API_BASE_URL = "/api/v1";

// Simulate network latency for mock data
export const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Placeholder API client to be connected to FastAPI later
export const apiClient = {
  get: async (endpoint) => {
    console.log(`[API MOCK] GET ${API_BASE_URL}${endpoint}`);
    return {};
  },
  post: async (endpoint, payload) => {
    console.log(`[API MOCK] POST ${API_BASE_URL}${endpoint}`, payload);
    return {};
  }
};
