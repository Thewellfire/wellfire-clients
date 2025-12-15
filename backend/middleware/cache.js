import NodeCache from 'node-cache';

// Create cache instance with 5 minute TTL
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Don't clone objects for better performance
});

// Cache middleware for GET requests
export const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const key = `${req.originalUrl || req.url}`;
    
    // Check if data exists in cache
    const cachedData = cache.get(key);
    
    if (cachedData) {
      console.log(`Cache hit: ${key}`);
      // Add cache headers
      res.set({
        'X-Cache': 'HIT',
        'Cache-Control': `public, max-age=${duration}`,
        'ETag': `"${Date.now()}"`,
      });
      return res.json(cachedData);
    }

    // Store original res.json
    const originalJson = res.json.bind(res);
    
    // Override res.json to cache the response
    res.json = (body) => {
      // Only cache successful responses
      if (res.statusCode === 200 && body.success) {
        cache.set(key, body, duration);
        console.log(`Cached: ${key}`);
      }
      
      // Add cache headers
      res.set({
        'X-Cache': 'MISS',
        'Cache-Control': `public, max-age=${duration}`,
        'ETag': `"${Date.now()}"`,
      });
      
      return originalJson(body);
    };
    
    next();
  };
};

// Clear cache for specific pattern
export const clearCache = (pattern) => {
  const keys = cache.keys();
  const deletedKeys = [];
  
  keys.forEach(key => {
    if (!pattern || key.includes(pattern)) {
      cache.del(key);
      deletedKeys.push(key);
    }
  });
  
  console.log(`Cleared ${deletedKeys.length} cache entries`);
  return deletedKeys;
};

// Get cache statistics
export const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
};

export default cache;
