import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const LoadingScreen = ({ isLoading, onComplete }) => {
  const location = useLocation();

  // Prevent body scroll and position shifts when loading screen is active
  React.useEffect(() => {
    if (isLoading) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Prevent scrolling and position shifts
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
    };
  }, [isLoading]);
  const [isMobile, setIsMobile] = useState(() => {
    // Initialize with proper mobile detection on first render
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      return isMobileDevice || width < 768;
    }
    return false;
  });
  const [shouldRender, setShouldRender] = useState(() => {
    // Start with shouldRender = isMobile
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      return isMobileDevice || width < 768;
    }
    return false;
  });
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const mobile = isMobileDevice || width < 768;
        
        console.log('📱 LoadingScreen mobile check:', {
          width,
          isMobileDevice,
          mobile,
          isLoading
        });
        
        setIsMobile(mobile);
        setShouldRender(mobile && isLoading);
        
        if (!mobile) {
          console.log('📱 LoadingScreen: Desktop detected, completing immediately');
          onComplete && onComplete();
        }
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [onComplete, isLoading]);

  // Set minimum time elapsed after 1 second
  useEffect(() => {
    if (!isMobile || !isLoading) return;

    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
      console.log('📱 LoadingScreen: Minimum time elapsed (1s)');
    }, 1000); // Reduced from 2s to 1s

    return () => clearTimeout(timer);
  }, [isMobile, isLoading]);

  // Listen for LC1 data readiness
  useEffect(() => {
    if (!isMobile || !isLoading) return;

    const checkDataReadiness = () => {
      // Ensure global status exists
      if (!window.wellfireLoadingStatus) {
        window.wellfireLoadingStatus = { Music: false, Film: false, Commercial: false };
        return;
      }

      // Check if all LC1 sections are ready
      const musicReady = window.wellfireLoadingStatus.Music || false;
      const filmReady = window.wellfireLoadingStatus.Film || false;
      const commercialReady = window.wellfireLoadingStatus.Commercial || false;
      
      const allReady = musicReady && filmReady && commercialReady;
      
      console.log('📱 LoadingScreen: Checking data readiness:', {
        Music: musicReady,
        Film: filmReady,
        Commercial: commercialReady,
        allReady,
        currentDataReady: dataReady
      });
      
      if (allReady !== dataReady) {
        setDataReady(allReady);
        console.log('📱 LoadingScreen: Data readiness CHANGED to:', allReady);
      }
    };

    // Check immediately
    checkDataReadiness();

    // Set up interval to check periodically (more frequent for better responsiveness)
    const interval = setInterval(checkDataReadiness, 200);
    return () => clearInterval(interval);
  }, [dataReady, isMobile, isLoading]);

  // Complete loading when both conditions are met
  useEffect(() => {
    if (!isMobile) return;
    if (!isLoading) {
      setShouldRender(false);
      return;
    }

    console.log('📱 LoadingScreen conditions:', {
      minTimeElapsed,
      dataReady,
      canComplete: minTimeElapsed && dataReady
    });

    // Complete when both minimum time has elapsed AND all data is ready
    if (minTimeElapsed && dataReady) {
      console.log('✅ LoadingScreen: Both conditions met, completing...');
      const timer = setTimeout(() => {
        onComplete && onComplete();
        setShouldRender(false);
      }, 200); // Reduced transition delay

      return () => clearTimeout(timer);
    }
  }, [isMobile, isLoading, minTimeElapsed, dataReady, onComplete]);

  console.log('📱 LoadingScreen render check:', {
    isMobile,
    shouldRender,
    isLoading,
    pathname: location.pathname,
    willRender: isMobile && shouldRender && isLoading
  });

  // TEMPORARY DEBUG: Force show LoadingScreen on mobile (remove this after testing)
  const isDebugMode = false; // Set to true to force show LoadingScreen
  if (isDebugMode && isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl mb-4">DEBUG LOADING SCREEN</h1>
          <p>isMobile: {isMobile.toString()}</p>
          <p>shouldRender: {shouldRender.toString()}</p>
          <p>isLoading: {isLoading.toString()}</p>
          <p>pathname: {location.pathname}</p>
        </div>
      </div>
    );
  }

  if (!isMobile || !shouldRender) {
    console.log('📱 LoadingScreen: Not rendering - mobile:', isMobile, 'shouldRender:', shouldRender);
    return null;
  }

  return (
    <AnimatePresence>
      {isLoading && shouldRender && (
        <motion.div
          className="wellfire-loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            minHeight: '100vh',
            maxHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backgroundColor: '#000000',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box'
          }}
        >
          {/* Simple Logo and Loading */}
          <div 
            className="text-center w-full max-w-md px-4"
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '400px',
              margin: '0 auto',
              textAlign: 'center'
            }}
          >
            <motion.h1
              className={`${isMobile ? 'text-3xl' : 'text-4xl md:text-6xl'} font-bold text-white mb-4 sm:mb-6`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              WELLFIRE
            </motion.h1>
            
            {/* Page-specific subtitle */}
            <motion.p
              className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8"
 
            >
              {(location.pathname === "/Latestcollection1" || 
                location.pathname === "/latestcollection1" || 
                location.pathname === "/LatestCollection1")
                ? "Welcome to Wellfire " 
                : "Welcome to Wellfire"
              }
            </motion.p>
            
            
            
            {/* Simple Loading Dots */}
            <div className={`flex justify-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} bg-red-500 rounded-full`}
                  animate={{
                    y: [-10, 0, -10],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
