import React, { useEffect, useRef, useState } from 'react';

const LazyComponent = ({ 
  children, 
  threshold = 0.1, 
  rootMargin = '50px',
  fallback = null,
  once = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If component has already been visible and once=true, don't observe again
    if (hasBeenVisible && once) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setIsVisible(isIntersecting);
        
        if (isIntersecting && once) {
          setHasBeenVisible(true);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, once, hasBeenVisible]);

  return (
    <div ref={elementRef}>
      {(isVisible || hasBeenVisible) ? children : fallback}
    </div>
  );
};

export default LazyComponent;
