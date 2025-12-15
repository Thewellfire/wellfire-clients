import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

/**
 * PageLoader - DESKTOP ONLY Loading Screen
 * 
 * Shows a 2-second loading animation with WELLFIRE branding on desktop.
 * On mobile devices, content is shown immediately without any loader.
 * 
 * Features:
 * - Desktop: 2s loading animation with progress bar and floating particles
 * - Mobile: Immediate content display (no loading screen)
 * - Stable positioning with scroll prevention during loading
 * - Smooth transitions between loading and content states
 */

const getIsMobile = () => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  return isMobileDevice || width < 768;
};

const PageLoader = ({ children }) => {
  const [isMobile, setIsMobile] = useState(getIsMobile);
  // Desktop only: Start with loading=true, content=false
  // Mobile: Start with loading=false, content=true (no loader)
  const [isLoading, setIsLoading] = useState(() => !getIsMobile());
  const [showContent, setShowContent] = useState(() => getIsMobile());

  console.log('🖥️ PageLoader initialized:', { 
    isMobile: getIsMobile(), 
    isLoading: !getIsMobile(), 
    showContent: getIsMobile() 
  });

  // Prevent body scroll and position shifts when loading screen is active
  React.useEffect(() => {
    if (isLoading && !isMobile) {
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
  }, [isLoading, isMobile]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const mobile = getIsMobile();
      console.log('🖥️ PageLoader resize:', { mobile, currentIsMobile: isMobile });
      setIsMobile(mobile);
      if (mobile) {
        setIsLoading(false);
        setShowContent(true);
        console.log('🖥️ PageLoader: Mobile detected, hiding loader');
      } else {
        setIsLoading(true);
        setShowContent(false);
        console.log('🖥️ PageLoader: Desktop detected, showing loader');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    console.log('🖥️ PageLoader effect:', { isMobile, isLoading, showContent });
    
    if (isMobile) {
      // Mobile: No PageLoader, show content immediately
      setIsLoading(false);
      setShowContent(true);
      console.log('🖥️ PageLoader: Mobile - content shown immediately');
      return;
    }

    // Desktop only: Show PageLoader for 2 seconds
    console.log('🖥️ PageLoader: Desktop - starting 2s loader');
    let showTimer;
    const loaderTimer = setTimeout(() => {
      console.log('🖥️ PageLoader: Desktop - hiding loader');
      setIsLoading(false);
      showTimer = setTimeout(() => {
        setShowContent(true);
        console.log('🖥️ PageLoader: Desktop - showing content');
      }, 200);
    }, 2000);

    return () => {
      clearTimeout(loaderTimer);
      if (showTimer) clearTimeout(showTimer);
    };
  }, [isMobile]);

  // Mobile: Return children directly (no PageLoader)
  if (isMobile) {
    console.log('🖥️ PageLoader: Rendering mobile - no loader');
    return <>{children}</>;
  }

  // Desktop: Show PageLoader then content
  console.log('🖥️ PageLoader: Rendering desktop - with loader');
  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="wellfire-pageloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
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
            {/* Logo Animation */}
            <div 
              className="text-center"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '500px',
                margin: '0 auto',
                textAlign: 'center',
                padding: '0 20px'
              }}
            >
              <motion.div
                className="relative"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Main Logo */}
                <motion.h1
                  className="text-6xl md:text-6xl font-bold text-white mb-4"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  The Wellfire Media Network
                </motion.h1>
                
                {/* Tagline */}
                <motion.p
                  className="text-gray-400 text-lg md:text-xl text-red-500 tracking-wider"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  CREATIVE EXCELLENCE
                </motion.p>
              </motion.div>

             

              {/* Progress Bar */}
              <motion.div
                className="mt-6 w-64 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, delay: 0.8, ease: "easeInOut" }}
                />
              </motion.div>
            </div>

            {/* Background Animation */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                pointerEvents: 'none'
              }}
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-red-500/20 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [-20, 20, -20],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PageLoader;
