import { AnimatePresence } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Animation Components
import LoadingScreen from "./components/LoadingScreen";
import PageLoader from "./components/PageLoader";
import PageTransition from "./components/PageTransition";

// Layout Components
import AboutPreview from "./components/AboutPreview";
import Footer from "./components/Footer";
import TransparentNavbar from "./components/TransparentNavbar";

import ScrollToTop from "./components/ScrollToTop";

// Pages
import LatestCollection1 from "./components/LatestCollection1";
import About from "./pages/About";
import CategoryPage from "./pages/CategoryPage";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import InvestorProduct from "./pages/InvestorProduct";
import Investors from "./pages/Investors";
import Login from "./pages/Login";
import Photo from "./pages/Photo";
import ProfileEdit from "./pages/ProfileEdit";
import Services from "./pages/Services";

const MOBILE_BREAKPOINT = 768;

const App = () => {
  const location = useLocation();
  const initialMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const mobileViewport = isMobileDevice || width < MOBILE_BREAKPOINT;
    const isHomePage = location.pathname === "/";
    const isLC1Page = location.pathname === "/Latestcollection1" || 
                      location.pathname === "/latestcollection1" || 
                      location.pathname === "/LatestCollection1";
    const result = mobileViewport && (isHomePage || isLC1Page);
    
    console.log('🏠 App initialMobile calculation:', {
      width,
      isMobileDevice,
      mobileViewport,
      pathname: location.pathname,
      isHomePage,
      isLC1Page,
      result
    });
    
    return result;
  }, [location.pathname]);

  const initialDesktop = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= MOBILE_BREAKPOINT;
  }, []);

  const [isMobile, setIsMobile] = useState(initialMobile);
  const [isLoading, setIsLoading] = useState(initialMobile);
  const [showContent, setShowContent] = useState(() => {
    const isHomePage = location.pathname === "/";
    const isLC1Page = location.pathname === "/Latestcollection1" || 
                      location.pathname === "/latestcollection1" || 
                      location.pathname === "/LatestCollection1";
    const shouldShowContent = (!isHomePage && !isLC1Page) || !initialMobile;
    
    console.log('🏠 App showContent initial state:', {
      pathname: location.pathname,
      isHomePage,
      isLC1Page,
      initialMobile,
      shouldShowContent
    });
    
    return shouldShowContent;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const mobileViewport = isMobileDevice || width < MOBILE_BREAKPOINT;
      const isHomePage = location.pathname === "/";
      const isLC1Page = location.pathname === "/Latestcollection1" || 
                        location.pathname === "/latestcollection1" || 
                        location.pathname === "/LatestCollection1";
      const mobileWithLoadingScreen = mobileViewport && (isHomePage || isLC1Page);
      
      console.log('🏠 App mobile detection:', {
        width,
        isMobileDevice,
        mobileViewport,
        pathname: location.pathname,
        isHomePage,
        isLC1Page,
        mobileWithLoadingScreen
      });
      
      setIsMobile(mobileWithLoadingScreen);
    };

    handleResize(); // Call immediately
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [location.pathname]);

  useEffect(() => {
    const isHomePage = location.pathname === "/";
    const isLC1Page = location.pathname === "/Latestcollection1" || 
                      location.pathname === "/latestcollection1" || 
                      location.pathname === "/LatestCollection1";
    
    if (isMobile && (isHomePage || isLC1Page)) {
      // Initialize global loading status for coordination
      window.wellfireLoadingStatus = {
        Music: false,
        Film: false,
        Commercial: false
      };
      
      console.log(`🏠 App: Starting loading for ${location.pathname}`);
      setIsLoading(true);
      // Show content immediately so LC1 can start loading in parallel
      setShowContent(true);
    } else {
      setIsLoading(false);
      setShowContent(true);
    }
  }, [isMobile, location.pathname]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setShowContent(true);
  };

  const pageContent = (
    <PageTransition key={location.pathname}>
      <ScrollToTop />

      <ToastContainer
        position="top-center"
        autoClose={1000}
        limit={1}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />

      <TransparentNavbar />

      <div className="px-0">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/investorproduct/:id?" element={<InvestorProduct />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
          <Route path="/about" element={<About />} />
          <Route path="/aboutpreview" element={<AboutPreview showViewMore={false} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/Latestcollection1" element={<LatestCollection1 />} />
          <Route path="/photo" element={<Photo />} />
        </Routes>

        <Footer />
      </div>
    </PageTransition>
  );

  console.log('🏠 App render decision:', {
    isMobile,
    isLoading,
    showContent,
    pathname: location.pathname
  });

  if (isMobile) {
    console.log('🏠 App: Rendering mobile layout with LoadingScreen');
    return (
      <>
        {/* Mobile: Use LoadingScreen */}
        <LoadingScreen isLoading={isLoading} onComplete={handleLoadingComplete} />
        <AnimatePresence mode="wait">
          {showContent && pageContent}
        </AnimatePresence>
        
        {/* DEBUG: Quick navigation for testing */}
        {location.pathname === "/" && (
          <div className="fixed bottom-4 right-4 z-[10000]">
           
          </div>
        )}
        {(location.pathname === "/Latestcollection1" || 
          location.pathname === "/latestcollection1" || 
          location.pathname === "/LatestCollection1") && (
          <div className="fixed bottom-4 right-4 z-[10000]">
           
          </div>
        )}
      </>
    );
  }

  // Desktop: Use PageLoader
  return <PageLoader>{pageContent}</PageLoader>;
};

export default App;
