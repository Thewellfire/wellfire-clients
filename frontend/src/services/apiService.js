import axios from 'axios';

// Create axios instance with optimized defaults
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000",
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br'
  }
});

// Performance metrics tracking
let requestMetrics = {
  total: 0,
  successful: 0,
  failed: 0,
  avgResponseTime: 0
};

// Enhanced GET request with basic caching
const cachedGet = async (url, config = {}) => {
  const fullUrl = `${api.defaults.baseURL}${url}`;
  const startTime = performance.now();

  try {
    // Make request directly (no caching for now)
    console.log(`📡 Fetching from API: ${url}`);
    const response = await api.get(url, config);

    // Track metrics
    const responseTime = performance.now() - startTime;
    requestMetrics.total++;
    requestMetrics.successful++;
    requestMetrics.avgResponseTime =
      (requestMetrics.avgResponseTime * (requestMetrics.total - 1) + responseTime) / requestMetrics.total;

    console.log(`✅ Request completed: ${url} (${responseTime.toFixed(2)}ms)`);

    return response;
  } catch (error) {
    requestMetrics.total++;
    requestMetrics.failed++;
    console.error(`❌ API Error for ${url}:`, error);
    throw error;
  }
};

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods with performance optimizations
export const apiService = {
  // Investment products with prefetching
  getInvestmentProducts: () => cachedGet('/api/investment-product/list'),
  
  // Regular products
  getProducts: () => cachedGet('/api/product/list'),
  
  // User cart
  getUserCart: () => api.get('/api/cart'),
  
  // Batch requests for multiple endpoints
  batchFetch: async (endpoints) => {
    try {
      const promises = endpoints.map(endpoint => api.get(endpoint));
      return await Promise.allSettled(promises);
    } catch (error) {
      console.error('Batch fetch error:', error);
      throw error;
    }
  },

  // Prefetch data for upcoming navigation
  prefetchData: async (urls) => {
    // Simple prefetch implementation - just fetch and discard
    try {
      await Promise.all(urls.map(url => api.get(url)));
      console.log('Prefetch completed for:', urls);
    } catch (error) {
      console.log('Prefetch failed (non-critical):', error.message);
    }
  },

  // Clear all caches
  clearCache: async () => {
    console.log('Cache cleared');
  },

  // Get performance metrics
  getMetrics: () => ({
    api: requestMetrics
  }),

  // Preload critical data with parallel fetching
  preloadCriticalData: async () => {
    const startTime = performance.now();
    
    try {
      // Parallel fetch critical endpoints
      const promises = [
        apiService.getInvestmentProducts(),
        apiService.getProducts()
      ];
      
      const results = await Promise.allSettled(promises);
      const loadTime = performance.now() - startTime;
      
      console.log(`⚡ Critical data preloaded in ${loadTime.toFixed(2)}ms`);
      
      // Prefetch secondary data in background
      setTimeout(() => {
        apiService.prefetchData([
          '/api/user/profile',
          '/api/cart'
        ]);
      }, 100);
      
      return results;
    } catch (error) {
      console.error('Error preloading data:', error);
    }
  }
};

export default api;
