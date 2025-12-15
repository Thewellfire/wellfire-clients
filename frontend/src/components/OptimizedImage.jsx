import React, { useState, useEffect, useRef } from 'react';
import performanceService from '../services/performanceService';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  quality = 80,
  placeholder = 'blur',
  onLoad = null,
  sizes = null,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const [blurDataUrl, setBlurDataUrl] = useState(null);

  // Generate optimized Cloudinary URL with responsive sizing
  const getOptimizedUrl = (originalSrc, requestedWidth = null) => {
    if (!originalSrc) return '';
    
    // Check if it's a Cloudinary URL
    if (originalSrc.includes('cloudinary.com')) {
      const parts = originalSrc.split('/upload/');
      if (parts.length === 2) {
        // Determine optimal width based on device
        const devicePixelRatio = window.devicePixelRatio || 1;
        const optimalWidth = requestedWidth 
          ? Math.round(requestedWidth * devicePixelRatio)
          : width 
          ? Math.round(width * devicePixelRatio)
          : null;
        
        // Add Cloudinary transformations for optimization
        const transformations = [
          `q_${quality}`, // Quality
          'f_auto', // Auto format (WebP, AVIF, etc.)
          'fl_progressive', // Progressive loading
          optimalWidth ? `w_${optimalWidth}` : '',
          height ? `h_${height}` : '',
          'c_limit', // Limit dimensions
          'dpr_auto', // Auto DPR for retina displays
          'fl_awebp', // Prefer WebP with fallback
          'fl_lossy', // Allow lossy compression
          'e_sharpen:50' // Slight sharpening for clarity
        ].filter(Boolean).join(',');
        
        return `${parts[0]}/upload/${transformations}/${parts[1]}`;
      }
    }
    
    return originalSrc;
  };

  // Generate blur placeholder
  const generateBlurDataUrl = async (src) => {
    if (!src || !src.includes('cloudinary.com')) return null;
    
    const parts = src.split('/upload/');
    if (parts.length === 2) {
      // Ultra-low quality placeholder
      const placeholderUrl = `${parts[0]}/upload/w_20,q_10,f_auto,e_blur:1000/${parts[1]}`;
      return placeholderUrl;
    }
    return null;
  };

  useEffect(() => {
    // Generate blur placeholder
    generateBlurDataUrl(src).then(setBlurDataUrl);
    
    const optimizedSrc = getOptimizedUrl(src);
    
    if (priority) {
      // Load immediately for priority images with preload hint
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedSrc;
      document.head.appendChild(link);
      
      setImageSrc(optimizedSrc);
    } else {
      // Lazy load for non-priority images
      const element = imgRef.current;
      if (!element) return;

      performanceService.observeElement(
        element,
        () => {
          // Preload image before setting src
          const img = new Image();
          img.onload = () => {
            setImageSrc(optimizedSrc);
            setIsLoading(false);
            if (onLoad) onLoad();
          };
          img.onerror = () => {
            setError(true);
            setIsLoading(false);
          };
          img.src = optimizedSrc;
        },
        { 
          rootMargin: '200px', // Load earlier for smoother experience
          threshold: 0.01, 
          once: true 
        }
      );

      return () => {
        performanceService.unobserveElement(element);
      };
    }
  }, [src, priority, quality, width, height, onLoad]);

  if (error) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div ref={imgRef} className="relative overflow-hidden">
      {/* Blur placeholder */}
      {blurDataUrl && isLoading && !priority && (
        <img
          src={blurDataUrl}
          alt=""
          className={`absolute inset-0 w-full h-full ${className}`}
          style={{
            filter: 'blur(20px)',
            transform: 'scale(1.1)'
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Loading skeleton */}
      {isLoading && !blurDataUrl && !priority && (
        <div className={`absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer ${className}`} />
      )}
      
      {/* Main image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={className}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={priority ? 'high' : 'auto'}
          style={{
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
          onLoad={() => {
            setIsLoading(false);
            if (onLoad) onLoad();
          }}
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
