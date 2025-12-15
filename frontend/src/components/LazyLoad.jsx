import React, { useEffect, useRef, useState } from 'react';
import performanceService from '../services/performanceService';

const LazyLoad = ({ 
  children, 
  placeholder = <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />,
  rootMargin = '100px',
  threshold = 0.01,
  className = '',
  onVisible = null
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Use performance service's observer
    performanceService.observeElement(
      element,
      () => {
        setIsVisible(true);
        if (onVisible) onVisible();
      },
      { 
        rootMargin, 
        threshold, 
        once: true 
      }
    );

    return () => {
      performanceService.unobserveElement(element);
    };
  }, [rootMargin, threshold, onVisible]);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? children : placeholder}
    </div>
  );
};

export default LazyLoad;
