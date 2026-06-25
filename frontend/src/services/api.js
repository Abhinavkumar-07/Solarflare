export const API_BASE_URL = "http://localhost:8000/api";

const cache = new Map();
const CACHE_TTL = 10000; // 10 seconds

// Simulate network latency for mock data fallback if needed
export const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 500) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, backoff * Math.pow(2, i)));
    }
  }
};

export const apiClient = {
  get: async (endpoint) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Check Cache
    if (cache.has(url)) {
      const { data, timestamp } = cache.get(url);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
    
    // Fetch with retries
    const data = await fetchWithRetry(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    // Update cache
    cache.set(url, { data, timestamp: Date.now() });
    return data;
  },
  post: async (endpoint, payload) => {
    const url = `${API_BASE_URL}${endpoint}`;
    return await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }
};
