import compression from 'compression';

// Response time tracking middleware
export const responseTime = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${duration}ms`);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`⚠️ Slow request detected: ${req.originalUrl} took ${duration}ms`);
    }
  });
  
  next();
};

// Compression middleware configuration
export const compressionConfig = compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses > 1kb
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  }
});

// Request optimization middleware
export const optimizeRequest = (req, res, next) => {
  // Set performance headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  
  const start = Date.now();
  
  // Store response time in a variable instead of setting header after response
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Just log it, don't try to set headers after response is sent
    if (duration > 500) {
      console.log(`⚠️ Slow response: ${req.method} ${req.originalUrl} - ${duration}ms`);
    }
  });
  
  next();
};

// Pagination middleware
export const paginate = (defaultLimit = 20, maxLimit = 100) => {
  return (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || defaultLimit;
    
    // Ensure limit doesn't exceed maxLimit
    limit = Math.min(limit, maxLimit);
    
    const skip = (page - 1) * limit;
    
    req.pagination = {
      page,
      limit,
      skip
    };
    
    next();
  };
};

// Query optimization middleware
export const optimizeQuery = (req, res, next) => {
  // Add lean() to mongoose queries for better performance
  if (req.query.lean !== 'false') {
    req.lean = true;
  }
  
  // Add field selection if specified
  if (req.query.fields) {
    req.selectedFields = req.query.fields.split(',').join(' ');
  }
  
  // Add sorting
  if (req.query.sort) {
    req.sort = req.query.sort;
  }
  
  next();
};

export default {
  responseTime,
  compressionConfig,
  optimizeRequest,
  paginate,
  optimizeQuery
};
