import axios from "axios";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HomeServices = () => {
  const [latest, setLatest] = useState({
    mediaproduction: null,
    lineproductionservices: null,
    governmentsubsidyguidance: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showLineProductionPopup, setShowLineProductionPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestItems = async () => {
      try {
        setIsLoading(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
        const response = await axios.get(`${backendUrl}/api/investment-product/list`);
        
        if (response.data.success && response.data.products) {
          const products = response.data.products;
          
          const getLatest = (category) => {
            return products
              .filter((item) => item.category?.toLowerCase() === category.toLowerCase())
              .sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id))[0] || null;
          };

          setLatest({
            mediaproduction: getLatest("Media Production"),
            lineproductionservices: getLatest("Line Production Services"),
            governmentsubsidyguidance: getLatest("Government Subsidy Guidance"),
          });
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestItems();
  }, []);

  const ServiceCard = ({ product, title, target, description, isLineProduction = false }) => {
    if (!product) {
      return (
        <motion.div
          className="flex flex-col gap-2 animate-pulse"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="w-full h-32 bg-gray-300 rounded-lg"></div>
          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
          <div className="space-y-1">
            <div className="h-2 bg-gray-300 rounded"></div>
            <div className="h-2 bg-gray-300 rounded w-2/3"></div>
          </div>
        </motion.div>
      );
    }

    const handleClick = () => {
      if (isLineProduction) {
        setShowLineProductionPopup(true);
      } else {
        window.scrollTo(0, 0);
        navigate(`/photo#${target}`);
      }
    };
    
    return (
      <motion.div
        className="flex flex-col gap-3 sm:gap-2 cursor-pointer group active:scale-[0.98] transition-transform duration-150"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        onClick={handleClick}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          {/* Tag at Top Right Corner */}
          <div className="absolute top-0 right-0 bg-red-500 text-white px-2 sm:px-3 py-1 sm:py-1 rounded-bl-lg z-10">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              {title.split(' ')[0]}
            </span>
          </div>
          
          {/* Product Image */}
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={product.coverImage || product.image || "https://via.placeholder.com/400x300?text=No+Image"}
              alt={product.productTitle || product.name || title}
              className="w-full h-64 sm:h-72 md:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
            />
           
          </div>
        </div>

        {/* Product Name */}
        <h3 
          className="text-sm sm:text-xs font-semibold text-white line-clamp-1 mb-1"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: "600",
          }}
        >
          {product.productTitle || product.name || title}
        </h3>

        {/* Description - Exactly 2 lines */}
        <p 
          className="text-gray-200 text-xs sm:text-[10px] leading-relaxed"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: "400",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </p>
      </motion.div>
    );
  };

  return (
    <section 
      className="relative px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20 bg-cover bg-center bg-fixed"
      
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6 md:gap-8 px-2 sm:px-4 md:px-0 relative z-10">
        {/* Left Intro */}
        <div className="space-y-4 md:space-y-3">
          <h2 
            className="text-xl sm:text-2xl md:text-lg text-white font-bold mb-4 md:mb-3 uppercase"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: "800",
            }}
          >
            Services
          </h2>
          <p 
            className="text-gray-200 mb-4 md:mb-3 text-sm sm:text-base md:text-xs leading-relaxed"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: "400",
            }}
          >
            At Wellfire Media, we don't just produce our own bold and visionary content — we also power other productions with world-class support.
          </p>
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/services');
            }}
            className="font-semibold text-white border-b-2 border-red-500 inline-block hover:text-red-400 transition-colors duration-300 text-sm md:text-xs py-1"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: "600",
            }}
          >
            View all services
          </button>
        </div>

        {/* Right Side - Service Cards */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4 md:gap-4">
          <ServiceCard
            product={latest.mediaproduction}
            title="Media Production"
            target="Media Production"
            description="We create original films, series, and digital media that spark ideas, inspire audiences, and push creative boundaries."
          />
          <ServiceCard
            product={latest.lineproductionservices}
            title="Line Production Services"
            target="Line Production Services"
            description="Beyond our own projects, we offer line production services to filmmakers, studios, and production houses worldwide."
          />
          <ServiceCard
            product={latest.governmentsubsidyguidance}
            title="Government Subsidy Guidance"
            target="Government Subsidy Guidance"
            description="When producing internationally, we help you access government subsidies and incentives in foreign lands."
          />
        </div>
      </div>
    </section>
  );
};

export default HomeServices;
