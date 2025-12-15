import { AnimatePresence } from "framer-motion";
import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Performance service for preloading
import { apiService } from "./services/apiService";

// Essential components (loaded immediately)
import LoadingScreen from "./components/LoadingScreen";
import PageLoader from "./components/PageLoader";

import ScrollToTop from "./components/ScrollToTop";

// Lazy load all pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const Investors = lazy(() => import("./pages/Investors"));
const InvestorProduct = lazy(() => import("./pages/InvestorProduct"));
const Photo = lazy(() => import("./pages/Photo"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));

// Lazy load heavy components
const TransparentNavbar = lazy(() => import("./components/TransparentNavbar"));
const Footer = lazy(() => import("./components/Footer"));
const AboutPreview = lazy(() => import("./components/AboutPreview"));
const PageTransition = lazy(() => import("./components/PageTransition"));
const LatestCollection1 = lazy(() => import("./components/LatestCollection1"));

const MOBILE_BREAKPOINT = 768;

// Optimized loading component
const OptimizedLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const AppOptimized = () => {
  const location = useLocation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [criticalDataLoaded, setCriticalDataLoaded] = useState(false);
  
  const initialMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    return isMobileDevice || width < MOBILE_BREAKPOINT;
  }, []);

  const [isMobile, setIsMobile] = useState(initialMobile);
  const [showAboutPreview, setShowAboutPreview] = useState(false);

  // Preload critical data on app mount
  useEffect(() => {
    const loadCriticalData = async () => {
      const startTime = performance.now();
      
      try {
        // Preload critical API data
        await apiService.preloadCriticalData();
        
        // Prefetch route chunks based on common navigation patterns
        const currentPath = location.pathname;
        const prefetchRoutes = [];
        
        if (currentPath === '/') {
          prefetchRoutes.push('/api/investment-product/list');
        } else if (currentPath.includes('/investor')) {
          prefetchRoutes.push('/api/investor/list');
        }
        
        if (prefetchRoutes.length > 0) {
          apiService.prefetchData(prefetchRoutes);
        }
        
        const loadTime = performance.now() - startTime;
        console.log(`⚡ Critical data loaded in ${loadTime.toFixed(2)}ms`);
        
        setCriticalDataLoaded(true);
      } catch (error) {
        console.error('Failed to load critical data:', error);
        setCriticalDataLoaded(true); // Continue anyway
      }
    };

    loadCriticalData();
    
    // Hide initial loader after a short delay
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const shouldBeMobile = width < MOBILE_BREAKPOINT;
      
      if (shouldBeMobile !== isMobile) {
        setIsMobile(shouldBeMobile);
      }
    };

    // Debounced resize handler
    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 150);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, [isMobile]);

  // Prefetch components on route change
  useEffect(() => {
    const path = location.pathname;
    
    // Prefetch related routes
    if (path === '/') {
      // Prefetch commonly accessed pages from home
      import('./pages/About');
      import('./pages/Services');
    } else if (path === '/investors') {
      // Prefetch investor product page
      import('./pages/InvestorProduct');
    }
  }, [location.pathname]);

  // Performance monitoring
  useEffect(() => {
    // Log performance metrics periodically
    const metricsInterval = setInterval(() => {
      const metrics = apiService.getMetrics();
      if (metrics.api.total > 0) {
        console.log('📊 Performance Metrics:', {
          avgResponseTime: `${metrics.api.avgResponseTime.toFixed(2)}ms`,
          successRate: `${((metrics.api.successful / metrics.api.total) * 100).toFixed(2)}%`,
          totalRequests: metrics.api.total
        });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(metricsInterval);
  }, []);

  // Show loading screen during initial load
  if (isInitialLoad && !criticalDataLoaded) {
    return <LoadingScreen />;
  }

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isHomePage = location.pathname === "/";
  const isLatestCollection = location.pathname.toLowerCase().includes("latestcollection");

  return (
    <div className="min-h-screen bg-black">
      <ScrollToTop />
      
      {/* Lazy load navbar */}
      {!isAuthPage && (
        <Suspense fallback={<div className="h-16" />}>
          <TransparentNavbar />
        </Suspense>
      )}

      {/* Main content with route-based code splitting */}
      <AnimatePresence mode="wait">
        <Suspense fallback={<OptimizedLoader />}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Home />
                </PageTransition>
              }
            />
            <Route
              path="/about"
              element={
                <PageTransition>
                  <About />
                </PageTransition>
              }
            />
            <Route
              path="/services"
              element={
                <PageTransition>
                  <Services />
                </PageTransition>
              }
            />
            <Route
              path="/contact"
              element={
                <PageTransition>
                  <Contact />
                </PageTransition>
              }
            />
            <Route
              path="/login"
              element={
                <PageTransition>
                  <Login />
                </PageTransition>
              }
            />
            <Route
              path="/profile"
              element={
                <PageTransition>
                  <ProfileEdit />
                </PageTransition>
              }
            />
            <Route
              path="/investors"
              element={
                <PageTransition>
                  <Investors />
                </PageTransition>
              }
            />
            <Route
              path="/investorproduct/:id?"
              element={
                <PageTransition>
                  <InvestorProduct />
                </PageTransition>
              }
            />
            <Route
              path="/photo"
              element={
                <PageTransition>
                  <Photo />
                </PageTransition>
              }
            />
            <Route
              path="/category/:category"
              element={
                <PageTransition>
                  <CategoryPage />
                </PageTransition>
              }
            />
            <Route
              path="/latestcollection1"
              element={
                <PageTransition>
                  <LatestCollection1 />
                </PageTransition>
              }
            />
          </Routes>
        </Suspense>
      </AnimatePresence>

      {/* About preview modal */}
      {showAboutPreview && (
        <Suspense fallback={null}>
          <AboutPreview onClose={() => setShowAboutPreview(false)} />
        </Suspense>
      )}

      {/* Footer */}
      {!isAuthPage && (
        <Suspense fallback={<div className="h-64 bg-black" />}>
          <Footer />
        </Suspense>
      )}

      {/* Toast notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="dark"
        limit={3}
      />

      {/* Page loader for transitions */}
      <PageLoader />
    </div>
  );
};

export default AppOptimized;
