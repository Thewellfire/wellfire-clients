import { useEffect, useRef } from 'react';

// Performance monitoring hook
export const usePerformanceMonitor = (componentName, dependencies = []) => {
  const startTimeRef = useRef(null);
  const mountTimeRef = useRef(null);

  useEffect(() => {
    // Track component mount time
    mountTimeRef.current = performance.now();
    console.log(`⏱️ ${componentName} mounted at ${mountTimeRef.current.toFixed(2)}ms`);

    return () => {
      const unmountTime = performance.now();
      const lifespan = unmountTime - mountTimeRef.current;
      console.log(`⏱️ ${componentName} unmounted after ${lifespan.toFixed(2)}ms`);
    };
  }, [componentName]);

  useEffect(() => {
    startTimeRef.current = performance.now();
  }, dependencies);

  const markComplete = (operationName = 'operation') => {
    if (startTimeRef.current) {
      const endTime = performance.now();
      const duration = endTime - startTimeRef.current;
      console.log(`⚡ ${componentName} ${operationName} completed in ${duration.toFixed(2)}ms`);
      return duration;
    }
    return 0;
  };

  return { markComplete };
};

// Hook to measure data fetching performance
export const useDataFetchPerformance = (url, isLoading, data) => {
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (isLoading && !startTimeRef.current) {
      startTimeRef.current = performance.now();
      console.log(`🚀 Data fetch started for ${url}`);
    }
  }, [isLoading, url]);

  useEffect(() => {
    if (!isLoading && data && startTimeRef.current) {
      const endTime = performance.now();
      const duration = endTime - startTimeRef.current;
      console.log(`📊 Data fetch completed for ${url} in ${duration.toFixed(2)}ms`);
      console.log(`📈 Data size: ${JSON.stringify(data).length} characters`);
      startTimeRef.current = null;
    }
  }, [isLoading, data, url]);
};

export default usePerformanceMonitor;
