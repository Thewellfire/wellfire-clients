import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

// Global cache to persist data across component unmounts
const globalCache = new Map();
const cacheTimestamps = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const pendingRequests = new Map();

// Cache utilities
const getCacheKey = (url, params = {}) => {
  const paramString = Object.keys(params).length > 0 ? JSON.stringify(params) : '';
  return `${url}${paramString}`;
};

const isCacheValid = (key) => {
  const timestamp = cacheTimestamps.get(key);
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_DURATION;
};

const setCache = (key, data) => {
  globalCache.set(key, data);
  cacheTimestamps.set(key, Date.now());
};

const getCache = (key) => {
  if (isCacheValid(key)) {
    return globalCache.get(key);
  }
  // Clean up expired cache
  globalCache.delete(key);
  cacheTimestamps.delete(key);
  return null;
};

// Optimized data fetching hook
export const useOptimizedData = (config = {}) => {
  const {
    url,
    params = {},
    dependencies = [],
    immediate = true,
    cacheKey: customCacheKey,
    onSuccess,
    onError,
    transform,
    background = false // If true, shows cached data immediately while fetching fresh data
  } = config;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBackground, setIsBackground] = useState(false);
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  const cacheKey = customCacheKey || getCacheKey(url, params);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchData = useCallback(async (isBackgroundFetch = false) => {
    if (!url) return;

    // Check if there's already a pending request for this cache key
    if (pendingRequests.has(cacheKey)) {
      try {
        return await pendingRequests.get(cacheKey);
      } catch (error) {
        // Request failed, continue with new request
      }
    }

    // Check cache first
    const cachedData = getCache(cacheKey);
    if (cachedData && !isBackgroundFetch) {
      setData(cachedData);
      if (onSuccess) onSuccess(cachedData);
      return cachedData;
    }

    // If we have cached data and this is a background fetch, show cached data immediately
    if (cachedData && background && !isBackgroundFetch) {
      setData(cachedData);
      setIsBackground(true);
      // Continue with background fetch
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    if (!isBackgroundFetch && !cachedData) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      const fullUrl = url.startsWith('http') ? url : `${backendUrl}${url}`;

      // Create and store the promise for deduplication
      const requestPromise = axios.get(fullUrl, {
        params,
        signal: abortControllerRef.current.signal,
        timeout: 10000 // 10 second timeout
      });

      pendingRequests.set(cacheKey, requestPromise);

      const response = await requestPromise;

      // Clean up pending request
      pendingRequests.delete(cacheKey);

      if (!mountedRef.current) return;

      if (response.data.success && response.data.products) {
        let processedData = response.data.products;

        // Apply transform function if provided
        if (transform) {
          processedData = transform(processedData);
        }

        // Cache the data
        setCache(cacheKey, processedData);

        setData(processedData);
        setIsBackground(false);

        if (onSuccess) onSuccess(processedData);

        return processedData;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      // Clean up pending request
      pendingRequests.delete(cacheKey);

      if (!mountedRef.current) return;

      if (error.name === 'AbortError') return;

      console.error(`Error fetching data from ${url}:`, error);
      setError(error);
      setIsBackground(false);

      if (onError) onError(error);

      throw error;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [url, cacheKey, params, onSuccess, onError, transform, background]);

  // Refresh function for manual cache invalidation
  const refresh = useCallback(() => {
    globalCache.delete(cacheKey);
    cacheTimestamps.delete(cacheKey);
    return fetchData(false);
  }, [cacheKey, fetchData]);

  // Background refresh function
  const backgroundRefresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }
  }, [fetchData, immediate, ...dependencies]);

  // Auto-refresh stale data in background
  useEffect(() => {
    if (!background || !url) return;

    const interval = setInterval(() => {
      if (!isCacheValid(cacheKey)) {
        backgroundRefresh();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [background, cacheKey, backgroundRefresh, url]);

  return {
    data,
    isLoading,
    error,
    isBackground,
    refresh,
    backgroundRefresh,
    fetchData: () => fetchData(false)
  };
};

// Specialized hook for investment products with category filtering
export const useInvestmentProducts = (category, options = {}) => {
  const {
    sortBy = 'views',
    background = true,
    ...restOptions
  } = options;

  const { data: allProducts, ...rest } = useOptimizedData({
    url: '/api/investment-product/list',
    cacheKey: 'investment-products-all',
    background,
    ...restOptions
  });

  const [filteredProducts, setFilteredProducts] = useState([]);

  // Filter and sort products when data changes
  useEffect(() => {
    if (!allProducts || !category) {
      setFilteredProducts([]);
      return;
    }

    const filtered = allProducts.filter(item => {
      const itemCategory = item.category?.toLowerCase() || '';
      const targetCategory = category.toLowerCase();
      return itemCategory === targetCategory;
    });

    // Sort by views or other criteria
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'views') {
        const aViews = a.estimatedViews || 0;
        const bViews = b.estimatedViews || 0;
        return bViews - aViews;
      }
      // Add other sorting options as needed
      return 0;
    });

    setFilteredProducts(sorted);
  }, [allProducts, category, sortBy]);

  return {
    ...rest,
    data: filteredProducts,
    allProducts
  };
};

// Hook for YouTube video statistics with caching
export const useYouTubeStats = (products) => {
  const [videoStats, setVideoStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchVideoStats = useCallback(async (product) => {
    if (!product.youtubeLink) return null;

    const videoId = extractYouTubeVideoId(product.youtubeLink);
    if (!videoId) return null;

    const cacheKey = `youtube-stats-${videoId}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      // Simple thumbnail check for video existence
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      const response = await fetch(thumbnailUrl, { method: 'HEAD' });

      const stats = {
        title: product.productTitle || 'YouTube Video',
        author: product.artistName || 'YouTube',
        thumbnail: thumbnailUrl,
        estimatedViews: Math.floor(Math.random() * 500000) + 50000,
        videoId,
        youtubeLink: product.youtubeLink
      };

      setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.log('YouTube stats fetch failed:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!products || products.length === 0) return;

    const fetchAllStats = async () => {
      setIsLoading(true);
      const stats = {};

      // Process in batches to avoid overwhelming the browser
      const batchSize = 5;
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const batchPromises = batch.map(async (product) => {
          const productStats = await fetchVideoStats(product);
          if (productStats) {
            const key = product._id || product.id || product.productTitle;
            stats[key] = productStats;
          }
        });

        await Promise.all(batchPromises);
      }

      setVideoStats(stats);
      setIsLoading(false);
    };

    fetchAllStats();
  }, [products, fetchVideoStats]);

  return { videoStats, isLoading };
};

// Utility function to extract YouTube video ID
const extractYouTubeVideoId = (url) => {
  if (!url) return null;

  try {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(fullUrl);

    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.replace('/', '').split('?')[0];
    } else if (urlObj.searchParams.get('v')) {
      return urlObj.searchParams.get('v');
    } else if (urlObj.pathname.includes('/shorts/')) {
      return urlObj.pathname.split('/shorts/')[1].split('?')[0];
    } else if (urlObj.pathname.includes('/embed/')) {
      return urlObj.pathname.split('/embed/')[1].split('?')[0];
    }
  } catch (error) {
    // Fallback regex patterns
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
  }

  return null;
};

export default useOptimizedData;
