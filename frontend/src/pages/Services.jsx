import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInvestmentProducts } from "../hooks/useApi";

const Services = () => {
  const [products, setProducts] = useState({
    mediaproduction: [],
    lineproductionservices: [],
    governmentsubsidyguidance: [],
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showLineProductionPopup, setShowLineProductionPopup] = useState(false);
  const [showMediaProductionPopup, setShowMediaProductionPopup] = useState(false);
  const [showGovernmentSubsidyPopup, setShowGovernmentSubsidyPopup] = useState(false);
  const navigate = useNavigate();

  // Use optimized hook for fetching investment products
  const { 
    data: allProducts, 
    loading: isLoading, 
    error 
  } = useInvestmentProducts();

  const services = [
    {
      title: "MEDIA PRODUCTION",
      subtitle: "Excellence Award for Creative Vision",
      description: "We create original films, series, and digital media that spark ideas, inspire audiences, and push creative boundaries.",
      target: "Media Production",
      category: "mediaproduction",
      defaultImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2059&q=80"
    },
    {
      title: "LINE PRODUCTION SERVICES",
      subtitle: "International Recognition for Global Support", 
      description: "Beyond our own projects, we offer line production services to filmmakers, studios, and production houses worldwide.",
      target: "Line Production Services",
      category: "lineproductionservices",
      defaultImage: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2050&q=80"
    },
    {
      title: "GOVERNMENT SUBSIDY GUIDANCE",
      subtitle: "Industry Award for Financial Innovation",
      description: "When producing internationally, we help you access government subsidies and incentives in foreign lands.",
      target: "Government Subsidy Guidance", 
      category: "governmentsubsidyguidance",
      defaultImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    }
  ];

  // Memoized grouped products to prevent unnecessary recalculations
  const groupedProducts = useMemo(() => {
    if (!allProducts) return {
      mediaproduction: [],
      lineproductionservices: [],
      governmentsubsidyguidance: [],
    };

    return {
      mediaproduction: allProducts.filter((item) => 
        item.category?.toLowerCase() === "media production"
      ),
      lineproductionservices: allProducts.filter((item) => 
        item.category?.toLowerCase() === "line production services"
      ),
      governmentsubsidyguidance: allProducts.filter((item) => 
        item.category?.toLowerCase() === "government subsidy guidance"
      ),
    };
  }, [allProducts]);

  // Update products when grouped products change
  useEffect(() => {
    setProducts(groupedProducts);
    
    // Set default selected product for current slide
    const currentProducts = groupedProducts[services[0].category];
    if (currentProducts && currentProducts.length > 0 && !selectedProduct) {
      setSelectedProduct(currentProducts[0]);
    }
  }, [groupedProducts]);

  // Update selected product when slide changes
  useEffect(() => {
    const currentProducts = products[services[currentSlide].category] || [];
    if (currentProducts.length > 0 && !selectedProduct) {
      setSelectedProduct(currentProducts[0]);
    } else if (currentProducts.length === 0) {
      setSelectedProduct(null);
    }
  }, [currentSlide, products, selectedProduct]);

 
  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const newSlide = (prev + 1) % services.length;
      const newProducts = products[services[newSlide].category] || [];
      if (newProducts.length > 0) {
        setSelectedProduct(newProducts[0]);
      }
      return newSlide;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const newSlide = (prev - 1 + services.length) % services.length;
      const newProducts = products[services[newSlide].category] || [];
      if (newProducts.length > 0) {
        setSelectedProduct(newProducts[0]);
      }
      return newSlide;
    });
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleProductClick = (product) => {
    window.scrollTo(0, 0);
    navigate(`/photo#${services[currentSlide].target}`, { state: { product } });
  };

  if (isLoading) {
    return (
      <section className="relative w-full h-screen bg-black flex items-center justify-center mobile-full-width">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-sm md:text-xl font-light tracking-[0.2em] animate-pulse hardware-accelerated"
        >
          LOADING...
        </motion.div>
      </section>
    );
  }

  const currentProducts = products[services[currentSlide].category] || [];
  const backgroundImage = selectedProduct?.coverImage || selectedProduct?.image || services[currentSlide].defaultImage;

  // Calculate dynamic height based on number of products
  const calculateDynamicHeight = () => {
    const productCount = currentProducts.length;

    if (productCount === 0) {
      return 'min-h-[70vh] sm:min-h-[80vh] lg:h-screen'; // Smaller mobile, standard desktop
    }

    if (productCount <= 3) {
      return 'min-h-[70vh] sm:min-h-[80vh] lg:h-screen'; // Smaller mobile, standard desktop
    }

    if (productCount <= 6) {
      return 'min-h-[85vh] sm:min-h-[95vh] lg:min-h-screen'; // Medium mobile, standard desktop
    }

    // For 7+ products, calculate height based on product count
    const extraHeight = Math.min((productCount - 6) * 8, 30); // Reduced extra height for mobile
    return `min-h-[${85 + extraHeight}vh] sm:min-h-[${95 + extraHeight}vh] lg:min-h-screen`;
  };

  const dynamicHeight = calculateDynamicHeight();

  return (
    <section className={`relative md:left-25 w-full ${dynamicHeight} bg-black overflow-hidden services-page mobile-full-width touch-action-manipulation`}>
      {/* Fullscreen Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentSlide}-${selectedProduct?._id}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: window.innerWidth < 768 ? 1.02 : 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${backgroundImage})`,
            }}
          />
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/70" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows - Mobile Optimized */}
      <button
        onClick={prevSlide}
        className="absolute left-4 sm:left-4 md:left-6 xl:left-10 top-1/2 -translate-y-1/2 z-30 w-14 h-14 sm:w-12 sm:h-12 md:w-14 md:h-14 xl:w-16 xl:h-16 rounded-full border-2 border-white/30 bg-black/40 backdrop-blur-md flex items-center justify-center text-white active:bg-white active:text-black hover:bg-white hover:text-black hover:border-white transition-all duration-200 group shadow-xl touch-target"
        aria-label="Previous service"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 xl:w-7 xl:h-7 group-hover:scale-110 transition-transform duration-200 -ml-0.5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 sm:right-4 md:right-6 xl:right-10 top-1/2 -translate-y-1/2 z-30 w-14 h-14 sm:w-12 sm:h-12 md:w-14 md:h-14 xl:w-16 xl:h-16 rounded-full border-2 border-white/30 bg-black/40 backdrop-blur-md flex items-center justify-center text-white active:bg-white active:text-black hover:bg-white hover:text-black hover:border-white transition-all duration-200 group shadow-xl touch-target"
        aria-label="Next service"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 xl:w-7 xl:h-7 group-hover:scale-110 transition-transform duration-200 ml-0.5" />
      </button>

      {/* Main Content - Mobile Optimized */}
      <div className={`relative z-10 ${currentProducts.length > 6 ? 'min-h-[30vh]' : 'min-h-[30vh]'} lg:h-full flex flex-col lg:flex-row px-6 sm:px-6 md:px-8 lg:px-16 xl:px-32 2xl:px-32 services-content mobile-padding`}>
        
        {/* Content Section */}
        <div className="w-full lg:w-3/5 h-auto lg:h-full flex flex-col justify-between py-2 sm:py-4 md:py-6 lg:py-12 services-content-section">
          {/* Header */}
          <div className="flex justify-between items-start mb-2 sm:mb-4 lg:mb-0 services-header">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden lg:block"
            >
              <h1 className="text-xs sm:text-sm md:text-lg xl:text-2xl font-bold text-yellow-400 tracking-[0.15em] sm:tracking-[0.2em] mb-2 md:mb-4 hardware-accelerated">
                WELLFIRE STUDIOS
              </h1>
              <p className="text-white/60 text-xs md:text-sm font-light tracking-[0.1em] sm:tracking-[0.15em] hardware-accelerated">
                CREATIVE SERVICES
              </p>
            </motion.div>

            {/* Social Icons */}
            <motion.div
              className="flex gap-2 md:gap-3 xl:gap-4 hidden lg:flex"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <a href="https://www.instagram.com/thewellfiremedianetwork" className="text-white/60 hover:text-white transition-colors touch-target" aria-label="Instagram">
                <div className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 border border-white/30 flex items-center justify-center text-xs font-light tracking-wide">IG</div>
              </a>
              <a href="https://www.youtube.com/@TheWellfirestudios" className="text-white/60 hover:text-white transition-colors touch-target" aria-label="YouTube">
                <div className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 border border-white/30 flex items-center justify-center text-xs font-light tracking-wide">YT</div>
              </a>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.6 }}
              >
                <motion.h2
                  className="text-2xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-6 tracking-wide leading-tight hardware-accelerated"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {services[currentSlide].title}
                </motion.h2>
                
                <motion.p
                  className="text-white/90 text-base sm:text-base md:text-lg xl:text-lg font-light leading-relaxed mb-6 sm:mb-6 md:mb-8 max-w-lg mobile-text-wrap"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.22 }}
                >
                  {services[currentSlide].description}
                </motion.p>

                {/* Mobile VIEW MORE Button - Enhanced */}
                <motion.div
                  className="flex lg:hidden justify-center pt-6"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <button
                    onClick={() => {
                      if (services[currentSlide].title === "LINE PRODUCTION SERVICES") {
                        setShowLineProductionPopup(true);
                      } else if (services[currentSlide].title === "MEDIA PRODUCTION") {
                        setShowMediaProductionPopup(true);
                      } else if (services[currentSlide].title === "GOVERNMENT SUBSIDY GUIDANCE") {
                        setShowGovernmentSubsidyPopup(true);
                      } else {
                        window.scrollTo(0, 0);
                        navigate('/contact');
                      }
                    }}
                    className="bg-red-500 text-white px-8 py-3 text-base font-bold tracking-wide active:bg-red-700 hover:bg-red-600 transition-colors flex items-center justify-center gap-3 group touch-target rounded-full shadow-xl active:shadow-2xl transform active:scale-95 transition-all duration-200"
                  >
                    VIEW MORE
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>

                <motion.div
                  className="hidden lg:flex flex-col sm:flex-row gap-3 md:gap-4"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <button
                    onClick={() => {
                      if (services[currentSlide].title === "LINE PRODUCTION SERVICES") {
                        setShowLineProductionPopup(true);
                      } else if (services[currentSlide].title === "MEDIA PRODUCTION") {
                        setShowMediaProductionPopup(true);
                      } else if (services[currentSlide].title === "GOVERNMENT SUBSIDY GUIDANCE") {
                        setShowGovernmentSubsidyPopup(true);
                      } else {
                        window.scrollTo(0, 0);
                        navigate('/contact');
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 text-sm font-medium tracking-wide hover:bg-red-600 transition-colors flex items-center justify-center gap-2 group touch-target rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    VIEW MORE
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>

                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 md:gap-6 mt-2 sm:mt-4 lg:mt-0 services-bottom-info">
          

            <motion.div
              className="flex items-center gap-4 sm:gap-6 md:gap-8 hidden sm:flex"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <div className="text-white/70 text-sm sm:text-base tracking-wide hardware-accelerated font-medium">
                {currentProducts.length} {currentProducts.length === 1 ? 'PROJECT' : 'PROJECTS'}
              </div>
              
              <div className="text-white font-semibold text-base sm:text-lg xl:text-xl tracking-wide hardware-accelerated">
                {String(currentSlide + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
              </div>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 sm:w-12 sm:h-12 xl:w-14 xl:h-14 border-2 border-white/40 bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 touch-target shadow-lg hover:shadow-xl transform hover:scale-110"
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
              >
                {isPlaying ? <Pause className="w-3 h-3 sm:w-3 sm:h-3 xl:w-4 xl:h-4" /> : <Play className="w-3 h-3 sm:w-3 sm:h-3 xl:w-4 xl:h-4 ml-0.5" />}
              </button>
            </motion.div>
          </div>
        </div>

        {/* Product Showcase Section */}
        <div className="w-full lg:w-3/5 h-auto lg:h-full flex items-center justify-center lg:justify-end py-2 sm:py-4 lg:py-0 lg:pr-8 xl:pr-16 2xl:pr-24 services-showcase">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="space-y-3 sm:space-y-4 md:space-y-5"
              >
                {/* Main Product Photo - No Names/Titles */}
                <motion.div
                  className="relative aspect-video rounded-lg overflow-hidden shadow-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <img
                    src={backgroundImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Coming Soon Message */}
                <motion.div
                  className="text-center py-4 sm:py-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                 
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 md:gap-4 z-30 hidden sm:flex">
        {services.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
              const newProducts = products[services[index].category] || [];
              if (newProducts.length > 0) {
                setSelectedProduct(newProducts[0]);
              }
            }}
            className={`h-1 transition-all duration-500 touch-target ${
              index === currentSlide ? 'bg-white w-8 sm:w-12 md:w-16' : 'bg-white/30 w-4 sm:w-6 md:w-8'
            }`}
            aria-label={`Go to service ${index + 1}`}
          />
        ))}
      </div>

      {/* Line Production Services Popup - Enhanced */}
      <AnimatePresence>
        {showLineProductionPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Enhanced Backdrop with Particles Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-black/90 via-gray-900/95 to-black/90 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowLineProductionPopup(false);
                window.scrollTo(0, 0);
              }}
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-red-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-blue-500 rounded-full blur-2xl animate-pulse delay-500"></div>
              </div>
            </motion.div>
            
            {/* Enhanced Popup Content */}
            <motion.div
              className="relative bg-gradient-to-br from-white via-gray-50 to-white rounded-xl md:rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-gray-200 mx-2 md:mx-4"
              initial={{ scale: 0.8, opacity: 0, y: 50, rotateX: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50, rotateX: 15 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)'
              }}
            >
              {/* Cinematic Header with Background Image */}
              <div className="relative h-24 md:h-32 bg-gradient-to-r from-gray-900 via-black to-gray-900 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2050&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
                
                {/* Header Content */}
                <div className="relative z-10 flex items-center justify-between h-full px-4 md:px-8">
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex-1 min-w-0"
                  >
                    <h2 className="text-xl md:text-3xl font-bold text-white tracking-wide truncate">
                      LINE PRODUCTION SERVICES
                    </h2>
                    <p className="text-gray-300 text-xs md:text-sm mt-1 tracking-wider">
                      GLOBAL FILM PRODUCTION SUPPORT
                    </p>
                  </motion.div>
                  
                  <motion.button
                    onClick={() => {
                      setShowLineProductionPopup(false);
                      window.scrollTo(0, 0);
                    }}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group flex-shrink-0 ml-4"
                    aria-label="Close popup"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Enhanced Scrollable Content */}
              <div className="overflow-y-auto max-h-[calc(95vh-96px)] md:max-h-[calc(95vh-128px)] bg-gradient-to-b from-white to-gray-50">
                {/* Hero Section */}
                <motion.div 
                  className="p-4 md:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Global Production Excellence</h3>
                      <p className="text-gray-700 text-xs md:text-base leading-relaxed">
                        We offer comprehensive line production services throughout India and key international locations, including the 
                        <span className="font-semibold text-indigo-600"> UAE, Bahrain, UK, USA, Canada, and Australia</span>.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Subsidies Section */}
                <motion.div 
                  className="p-4 md:p-8"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-xl font-bold text-gray-900">Government Subsidies & Incentives</h3>
                      <p className="text-gray-600 text-xs md:text-sm">Maximize your production value with expert guidance</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-green-200">
                    <p className="text-gray-700 text-xs md:text-base leading-relaxed mb-3 md:mb-4">
                      We specialize in leveraging government film shoot incentives to provide maximum value for your production across all our operating territories.
                    </p>
                    <p className="text-gray-700 text-xs md:text-base leading-relaxed">
                      Our expertise allows your project to efficiently access lucrative financial benefits such as 
                      <span className="font-semibold text-emerald-600"> cash rebates, grants, and tax credits</span> available worldwide.
                    </p>
                  </div>

                  {/* Country Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {[
                      {
                        country: "India",
                        flagUrl: "https://flagcdn.com/w80/in.png",
                        incentive: "Up to 40%",
                        description: "Utilizing central and state government incentives, including a national rebate of up to 40% on qualifying expenditure.",
                        color: "from-orange-500 to-red-500",
                        bgColor: "from-orange-50 to-red-50"
                      },
                      {
                        country: "UAE (Abu Dhabi)",
                        flagUrl: "https://flagcdn.com/w80/ae.png",
                        incentive: "30%",
                        description: "Accessing the 30% cash rebate on qualifying production spend.",
                        color: "from-green-500 to-teal-500",
                        bgColor: "from-green-50 to-teal-50"
                      },
                      {
                        country: "United Kingdom",
                        flagUrl: "https://flagcdn.com/w80/gb.png",
                        incentive: "AVEC & IFTC",
                        description: "Navigating the generous UK film tax relief system (Audio-Visual Expenditure Credit - AVEC) and the Independent Film Tax Credit (IFTC).",
                        color: "from-blue-500 to-indigo-500",
                        bgColor: "from-blue-50 to-indigo-50"
                      },
                      {
                        country: "United States",
                        flagUrl: "https://flagcdn.com/w80/us.png",
                        incentive: "State Credits",
                        description: "Securing state-level tax credits and rebates, which vary significantly by location.",
                        color: "from-red-500 to-pink-500",
                        bgColor: "from-red-50 to-pink-50"
                      },
                      {
                        country: "Canada",
                        flagUrl: "https://flagcdn.com/w80/ca.png",
                        incentive: "Federal & Provincial",
                        description: "Maximizing federal and provincial refundable tax credits on labor and local qualifying spend.",
                        color: "from-red-600 to-red-700",
                        bgColor: "from-red-50 to-red-100"
                      },
                      {
                        country: "Australia",
                        flagUrl: "https://flagcdn.com/w80/au.png",
                        incentive: "Up to 40%",
                        description: "Tapping into federal incentives like the Location Offset (up to 30%) and the Producer Offset (up to 40%), plus state-level film funds.",
                        color: "from-yellow-500 to-orange-500",
                        bgColor: "from-yellow-50 to-orange-50"
                      }
                    ].map((item, index) => (
                      <motion.div
                        key={item.country}
                        className={`bg-gradient-to-br ${item.bgColor} rounded-2xl p-4 md:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300`}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                      >
                        <div className="flex items-center justify-between gap-3 md:gap-4 mb-3 md:mb-4">
                          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                            <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0`}>
                              <img 
                                src={item.flagUrl} 
                                alt={`${item.country} flag`}
                                className="w-6 h-4 md:w-8 md:h-6 object-cover rounded-sm"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                              <div className="hidden w-full h-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                                {item.country.substring(0, 2).toUpperCase()}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base md:text-lg font-bold text-gray-900 truncate">{item.country}</h4>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <span className={`inline-block px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r ${item.color} text-white text-xs md:text-sm font-bold rounded-full shadow-lg border-2 border-white/20`}>
                              {item.incentive}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-xs md:text-sm">{item.description}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* International Co-Productions */}
                  <motion.div
                    className="mt-6 md:mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-200"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                  >
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base md:text-lg font-bold text-gray-900">International Co-Productions</h4>
                        <p className="text-gray-600 text-xs md:text-sm">Multi-country incentive access</p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-xs md:text-sm">
                      Facilitating projects under bilateral co-production treaties (where applicable) to access incentives in multiple countries simultaneously.
                    </p>
                  </motion.div>

                  {/* Final CTA Section */}
                  <motion.div
                    className="mt-6 md:mt-8 bg-gradient-to-r from-gray-900 to-black rounded-xl md:rounded-2xl p-6 md:p-8 text-center"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg">
                      <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-base md:text-xl font-bold text-white mb-3 md:mb-4">Complete Compliance Management</h3>
                    <p className="text-gray-300 text-xs md:text-base leading-relaxed max-w-3xl mx-auto">
                      We manage the entire application and compliance process, ensuring your production meets all local expenditure and criteria to successfully claim and maximize the available government subsidy.
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Production Popup */}
      <AnimatePresence>
        {showMediaProductionPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-black/90 via-gray-900/95 to-black/90 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowMediaProductionPopup(false);
                window.scrollTo(0, 0);
              }}
            />
            
            <motion.div
              className="relative bg-gradient-to-br from-white via-gray-50 to-white rounded-xl md:rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-gray-200 mx-2 md:mx-4"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="relative h-24 md:h-32 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=2059&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
                
                <div className="relative z-10 flex items-center justify-between h-full px-4 md:px-8">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl md:text-3xl font-bold text-white tracking-wide truncate">
                      MEDIA PRODUCTION
                    </h2>
                    <p className="text-gray-300 text-xs md:text-sm mt-1 tracking-wider">
                      CREATIVE EXCELLENCE & INNOVATION
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowMediaProductionPopup(false);
                      window.scrollTo(0, 0);
                    }}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group flex-shrink-0 ml-4"
                    aria-label="Close popup"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(95vh-96px)] md:max-h-[calc(95vh-128px)] bg-gradient-to-b from-white to-gray-50 p-4 md:p-8">
                <div className="space-y-6 md:space-y-8">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-200">
                    <h3 className="text-base md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Original Content Creation</h3>
                    <p className="text-gray-700 text-xs md:text-base leading-relaxed mb-4">
                      We specialize in creating original films, series, and digital media content that captivates audiences and pushes creative boundaries. Our production services include:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-2">Film Production</h4>
                        <p className="text-gray-600 text-xs md:text-sm">Feature films, documentaries, and short films</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-2">Series & Web Content</h4>
                        <p className="text-gray-600 text-xs md:text-sm">TV series, web series, and digital content</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-2">Commercial Production</h4>
                        <p className="text-gray-600 text-xs md:text-sm">Advertisements, corporate videos, and branded content</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-2">Music Videos</h4>
                        <p className="text-gray-600 text-xs md:text-sm">Creative music video production and direction</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl md:rounded-2xl p-6 md:p-8 text-center">
                    <h3 className="text-base md:text-xl font-bold text-white mb-3 md:mb-4">Award-Winning Creative Vision</h3>
                    <p className="text-gray-300 text-xs md:text-base leading-relaxed max-w-3xl mx-auto">
                      Our team combines technical expertise with creative storytelling to deliver content that not only meets industry standards but sets new benchmarks for excellence and innovation.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Government Subsidy Guidance Popup */}
      <AnimatePresence>
        {showGovernmentSubsidyPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Enhanced Backdrop */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-black/90 via-gray-900/95 to-black/90 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowGovernmentSubsidyPopup(false);
                window.scrollTo(0, 0);
              }}
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-green-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-blue-500 rounded-full blur-2xl animate-pulse delay-500"></div>
              </div>
            </motion.div>

            {/* Enhanced Popup Content */}
            <motion.div
              className="relative bg-gradient-to-br from-white via-gray-50 to-white rounded-xl md:rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-gray-200 mx-2 md:mx-4"
              initial={{ scale: 0.8, opacity: 0, y: 50, rotateX: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50, rotateX: 15 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)'
              }}
            >
              {/* Cinematic Header with Background Image */}
              <div className="relative h-24 md:h-32 bg-gradient-to-r from-gray-900 via-black to-gray-900 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1554224155-8d04cb21cd14?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />

                {/* Header Content */}
                <div className="relative z-10 flex items-center justify-between h-full px-4 md:px-8">
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex-1 min-w-0"
                  >
                    <h2 className="text-xl md:text-3xl font-bold text-white tracking-wide truncate">
                      GOVERNMENT SUBSIDY GUIDANCE
                    </h2>
                    <p className="text-gray-300 text-xs md:text-sm mt-1 tracking-wider">
                      INTERNATIONAL FILM INCENTIVES & TAX CREDITS
                    </p>
                  </motion.div>

                  <motion.button
                    onClick={() => {
                      setShowGovernmentSubsidyPopup(false);
                      window.scrollTo(0, 0);
                    }}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group flex-shrink-0 ml-4"
                    aria-label="Close popup"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Enhanced Scrollable Content */}
              <div className="overflow-y-auto max-h-[calc(95vh-96px)] md:max-h-[calc(95vh-128px)] bg-gradient-to-b from-white to-gray-50">
                {/* Hero Section */}
                <motion.div
                  className="p-4 md:p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Global Subsidy Expertise</h3>
                      <p className="text-gray-700 text-xs md:text-base leading-relaxed">
                        We provide comprehensive guidance on government film incentives across
                        <span className="font-semibold text-emerald-600"> India, UAE, UK, USA, Canada, Australia</span> and more.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Subsidy Details */}
                <motion.div
                  className="p-4 md:p-8"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-green-200">
                    <h3 className="text-base md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Maximize Your Production Value</h3>
                    <p className="text-gray-700 text-xs md:text-base leading-relaxed mb-4">
                      Access government subsidies and tax incentives to significantly reduce your production costs and increase your budget efficiency.
                    </p>
                    <p className="text-gray-700 text-xs md:text-base leading-relaxed">
                      Our expert team ensures you meet all compliance requirements while maximizing your eligible incentives across multiple territories.
                    </p>
                  </div>

                  {/* Country Incentive Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                    {[
                      {
                        country: "India",
                        incentive: "Up to 40%",
                        description: "Central and state government incentives including national rebate up to 40% on qualifying expenditure.",
                        color: "from-orange-500 to-red-500"
                      },
                      {
                        country: "UAE (Abu Dhabi)",
                        incentive: "30%",
                        description: "30% cash rebate on qualifying production spend in Abu Dhabi.",
                        color: "from-green-500 to-teal-500"
                      },
                      {
                        country: "United Kingdom",
                        incentive: "AVEC & IFTC",
                        description: "Audio-Visual Expenditure Credit (AVEC) and Independent Film Tax Credit (IFTC) programs.",
                        color: "from-blue-500 to-indigo-500"
                      },
                      {
                        country: "United States",
                        incentive: "State Credits",
                        description: "State-level tax credits and rebates varying by location and project scope.",
                        color: "from-red-500 to-pink-500"
                      },
                      {
                        country: "Canada",
                        incentive: "Federal & Provincial",
                        description: "Federal and provincial refundable tax credits on labor and local qualifying spend.",
                        color: "from-red-600 to-red-700"
                      },
                      {
                        country: "Australia",
                        incentive: "Up to 40%",
                        description: "Location Offset (up to 30%) and Producer Offset (up to 40%) plus state film funds.",
                        color: "from-yellow-500 to-orange-500"
                      }
                    ].map((item, index) => (
                      <motion.div
                        key={item.country}
                        className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                      >
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                          <h4 className="text-base md:text-lg font-bold text-gray-900">{item.country}</h4>
                          <span className={`inline-block px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r ${item.color} text-white text-xs md:text-sm font-bold rounded-full shadow-lg`}>
                            {item.incentive}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-xs md:text-sm">{item.description}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Services Offered */}
                  <motion.div
                    className="bg-gradient-to-r from-gray-900 to-black rounded-xl md:rounded-2xl p-6 md:p-8 text-center"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    <h3 className="text-base md:text-xl font-bold text-white mb-3 md:mb-4">Complete Compliance Management</h3>
                    <p className="text-gray-300 text-xs md:text-base leading-relaxed max-w-3xl mx-auto">
                      Our expertise ensures your production meets all local expenditure criteria and compliance requirements to successfully claim and maximize available government subsidies and tax incentives across all territories.
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile-specific styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .services-page {
            width: 100vw !important;
            margin-left: -50vw !important;
            left: 50% !important;
            position: relative !important;
            overflow: hidden !important;
          }
          .services-content {
            padding: 1rem !important;
          }
          .services-content-section {
            padding: 1.5rem 1rem !important;
          }
          .services-header {
            margin-bottom: 1.5rem !important;
          }
          .services-showcase {
            padding: 1rem !important;
          }
          .services-bottom-info {
            margin-top: 1rem !important;
            gap: 1rem !important;
            margin-bottom: 1rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Services;