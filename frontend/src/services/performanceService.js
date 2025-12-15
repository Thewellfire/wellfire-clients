// Advanced Performance Service with YouTube-like speed optimizations

class PerformanceService {
  constructor() {
    this.cache = new Map();
    this.prefetchQueue = new Set();
    this.observers = new Map();
    this.pendingRequests = new Map();
    this.cacheVersion = 'v1';
    this.maxCacheSize = 50 * 1024 * 1024; // 50MB
    this.currentCacheSize = 0;
    
    // Initialize IndexedDB for persistent caching
    this.initIndexedDB();
    
    // Start background tasks
    this.startBackgroundTasks();
    
    // Monitor performance
    this.initPerformanceMonitoring();
  }

  // Initialize IndexedDB for persistent storage
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('WellfireCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('apiCache')) {
          const store = db.createObjectStore('apiCache', { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('size', 'size', { unique: false });
        }
      };
    });
  }

  // Cache API response with size management
  async cacheResponse(url, data, ttl = 300000) { // 5 minutes default
    const dataSize = JSON.stringify(data).length;
    
    // Check cache size limit
    if (this.currentCacheSize + dataSize > this.maxCacheSize) {
      await this.evictOldestEntries();
    }
    
    const cacheEntry = {
      url,
      data,
      timestamp: Date.now(),
      ttl,
      size: dataSize,
      hits: 0
    };
    
    // Memory cache
    this.cache.set(url, cacheEntry);
    this.currentCacheSize += dataSize;
    
    // Persistent cache (IndexedDB)
    if (this.db) {
      const transaction = this.db.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');
      store.put(cacheEntry);
    }
    
    return cacheEntry;
  }

  // Get cached response with hit tracking
  async getCachedResponse(url) {
    // Check memory cache first
    let cacheEntry = this.cache.get(url);
    
    if (!cacheEntry && this.db) {
      // Check IndexedDB
      const transaction = this.db.transaction(['apiCache'], 'readonly');
      const store = transaction.objectStore('apiCache');
      const request = store.get(url);
      
      cacheEntry = await new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });
      
      // Load to memory cache if found
      if (cacheEntry) {
        this.cache.set(url, cacheEntry);
      }
    }
    
    if (cacheEntry) {
      const age = Date.now() - cacheEntry.timestamp;
      if (age < cacheEntry.ttl) {
        cacheEntry.hits++;
        console.log(`Cache HIT: ${url} (${cacheEntry.hits} hits, ${age}ms old)`);
        return cacheEntry.data;
      } else {
        // Cache expired
        this.removeFromCache(url);
      }
    }
    
    return null;
  }

  // Remove from cache
  async removeFromCache(url) {
    const entry = this.cache.get(url);
    if (entry) {
      this.currentCacheSize -= entry.size;
      this.cache.delete(url);
    }
    
    if (this.db) {
      const transaction = this.db.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');
      store.delete(url);
    }
  }

  // Evict oldest cache entries when size limit reached
  async evictOldestEntries() {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    let freedSpace = 0;
    const targetFree = this.maxCacheSize * 0.2; // Free 20% of cache
    
    for (const [url, entry] of entries) {
      if (freedSpace >= targetFree) break;
      freedSpace += entry.size;
      await this.removeFromCache(url);
    }
    
    console.log(`Evicted cache entries, freed ${freedSpace} bytes`);
  }

  // Prefetch data for improved perceived performance
  async prefetch(urls, priority = 'low') {
    const prefetchPromises = urls.map(async (url) => {
      // Skip if already cached or being fetched
      if (this.cache.has(url) || this.pendingRequests.has(url)) {
        return;
      }
      
      // Use requestIdleCallback for low priority
      if (priority === 'low' && 'requestIdleCallback' in window) {
        return new Promise((resolve) => {
          requestIdleCallback(async () => {
            await this.fetchWithCache(url);
            resolve();
          });
        });
      } else {
        // High priority - fetch immediately
        return this.fetchWithCache(url);
      }
    });
    
    return Promise.allSettled(prefetchPromises);
  }

  // Fetch with deduplication and caching
  async fetchWithCache(url, options = {}) {
    // Check cache first
    const cached = await this.getCachedResponse(url);
    if (cached && !options.forceRefresh) {
      return cached;
    }
    
    // Check if request is already pending
    if (this.pendingRequests.has(url)) {
      console.log(`Request already pending for: ${url}`);
      return this.pendingRequests.get(url);
    }
    
    // Create new request
    const requestPromise = fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Accept-Encoding': 'gzip, deflate, br',
      }
    })
    .then(async (response) => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      // Cache successful response
      await this.cacheResponse(url, data, options.cacheTTL);
      
      // Remove from pending
      this.pendingRequests.delete(url);
      
      return data;
    })
    .catch((error) => {
      this.pendingRequests.delete(url);
      throw error;
    });
    
    // Store pending request
    this.pendingRequests.set(url, requestPromise);
    
    return requestPromise;
  }

  // Intersection Observer for lazy loading
  observeElement(element, callback, options = {}) {
    const observerOptions = {
      root: null,
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.01
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
          // Optionally unobserve after first intersection
          if (options.once) {
            observer.unobserve(entry.target);
          }
        }
      });
    }, observerOptions);
    
    observer.observe(element);
    this.observers.set(element, observer);
    
    return observer;
  }

  // Clean up observer
  unobserveElement(element) {
    const observer = this.observers.get(element);
    if (observer) {
      observer.unobserve(element);
      observer.disconnect();
      this.observers.delete(element);
    }
  }

  // Batch API requests for efficiency
  async batchRequests(requests, batchSize = 5) {
    const results = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(req => this.fetchWithCache(req.url, req.options))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  // Performance monitoring
  initPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      // Monitor long tasks
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              });
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task monitoring not supported
      }
      
      // Monitor resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 1000) {
            console.warn('Slow resource:', {
              name: entry.name,
              duration: entry.duration,
              transferSize: entry.transferSize
            });
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  // Background tasks for optimization
  startBackgroundTasks() {
    // Periodic cache cleanup
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 60000); // Every minute
    
    // Preconnect to important domains
    this.preconnectDomains([
      'https://res.cloudinary.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ]);
  }

  // Clean up expired cache entries
  async cleanupExpiredCache() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        await this.removeFromCache(url);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`Cleaned ${cleaned} expired cache entries`);
    }
  }

  // Preconnect to domains for faster requests
  preconnectDomains(domains) {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // Get performance metrics
  getMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    return {
      cache: {
        size: this.cache.size,
        totalSize: this.currentCacheSize,
        maxSize: this.maxCacheSize,
        hitRate: this.calculateHitRate()
      },
      timing: {
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
      },
      pendingRequests: this.pendingRequests.size
    };
  }

  // Calculate cache hit rate
  calculateHitRate() {
    let totalHits = 0;
    let totalRequests = 0;
    
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
      totalRequests += entry.hits + 1;
    }
    
    return totalRequests > 0 ? (totalHits / totalRequests * 100).toFixed(2) + '%' : '0%';
  }

  // Clear all caches
  async clearAllCaches() {
    this.cache.clear();
    this.currentCacheSize = 0;
    this.pendingRequests.clear();
    
    if (this.db) {
      const transaction = this.db.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');
      store.clear();
    }
    
    console.log('All caches cleared');
  }
}

// Export singleton instance
export default new PerformanceService();
