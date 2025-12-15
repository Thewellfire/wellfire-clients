import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";

const Photo = () => {
  const { products } = useContext(ShopContext);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(16);
  const [totalPages, setTotalPages] = useState(1);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch all investment products
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setIsLoading(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
        const response = await axios.get(`${backendUrl}/api/investment-product/list`);
        
        if (response.data.success && response.data.products) {
          setAllProducts(response.data.products);
          setFilteredProducts(response.data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Calculate pagination
  useEffect(() => {
    setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
  }, [filteredProducts, itemsPerPage]);

  // Get current items for current page
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  };

  const currentItems = getCurrentItems();

  // Filter products by category
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter(
        (product) => product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, allProducts]);

  const categories = ["All", "Music", "Film", "Commercial"];

  const handleImageClick = (product) => {
    // Scroll to top before opening new content
    window.scrollTo(0, 0);
    
    if (product.youtubeLink) {
      window.open(product.youtubeLink, "_blank");
    } else if (product.videoFile) {
      window.open(product.videoFile, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        {/* Blank loading screen */}
      </div>
    );
  }
  
  // Error state
  if (allProducts.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: "700" }}>
            Unable to Load Portfolio
          </h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            We're having trouble loading our portfolio. Please check your connection and try again.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-white to-gray-300 text-black rounded-xl font-semibold hover:from-gray-100 hover:to-gray-200 transition-all duration-300"
            style={{ fontFamily: "Montserrat, sans-serif", fontWeight: "600" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
      <div className="min-h-screen bg-black text-white pt-4 md:pt-20 lg:pt-24">
      {/* Header */}
      <div className="container mx-auto px-6 sm:px-3 py-4 sm:py-6">
        <div className="mb-6 sm:mb-8">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl font-bold mb-2 sm:mb-3"
            style={{
              fontFamily: "",
              fontWeight: "500",
              letterSpacing: "0.1em",
            }}
          >
            OUR PORTFOLIO
          </h1>
        </div>

        {/* Category Filter */}
        <div className="flex mb-4 sm:mb-8">
          <div className="flex flex-wrap gap-2 sm:gap-4 px-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-2 sm:px-3 py-1 rounded-full transition-all duration-300 text-xs sm:text-sm ${
                  selectedCategory === category
                    ? "bg-white text-black"
                    : "bg-transparent text-white border border-white/30 hover:border-white/60"
                }`}
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: "400",
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

      

        {/* Photo Grid */}
        {currentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-6 md:gap-8">
            {currentItems.map((product, index) => (
              <div
                key={product._id || index}
                className="cursor-pointer relative"
                onClick={() => handleImageClick(product)}
              >
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 aspect-video sm:aspect-square shadow-2xl rounded-xl sm:rounded-none">
                  {/* Image with permanent enhanced effects */}
                  <img
                    src={
                      product.coverImage ||
                      product.image ||
                      "https://via.placeholder.com/400x400?text=No+Image"
                    }
                    alt={product.productTitle || product.name || "Product"}
                    className="w-full h-full object-cover transform scale-105 brightness-110"
                  />
                  
                  {/* Permanent Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />


                  {/* Permanent Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                    <h3
                      className="text-white font-bold text-xs sm:text-sm mb-1 line-clamp-2 drop-shadow-lg"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: "700",
                      }}
                    >
                      {product.productTitle || product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-200 text-xs truncate flex-1">
                        {product.artistName || "Unknown Artist"}
                      </span>
                      <div className="flex items-center gap-2 ml-2">
                        {product.youtubeLink && (
                          <span className="bg-red-500/20 backdrop-blur-sm text-red-400 px-2 py-1 rounded-full text-xs flex items-center gap-1 border border-red-400/30">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.5 6.2s-.2-1.6-.8-2.3c-.8-.8-1.7-.8-2.1-.9C17.8 2.8 12 2.8 12 2.8h0s-5.8 0-8.6.3c-.4 0-1.3.1-2.1.9-.6.7-.8 2.3-.8 2.3S0 8.1 0 10v1.9c0 1.9.2 3.8.2 3.8s.2 1.6.8 2.3c.8.8 1.8.8 2.3.9 1.7.2 7.2.3 8.7.3 0 0 5.8 0 8.6-.3.4 0 1.3-.1 2.1-.9.6-.7-.8-2.3-.8-2.3s.2-1.9.2-3.8V10c0-1.9-.2-3.8-.2-3.8zM9.6 13.8V7.9l6.1 3-6.1 2.9z" />
                            </svg>
                            <span className="hidden sm:inline">Video</span>
                          </span>
                        )}
                       
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              No {selectedCategory === "All" ? "" : selectedCategory.toLowerCase() + " "}items found
            </p>
          </div>
        )}
 

        {/* Enhanced Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 sm:mt-16 space-x-2 sm:space-x-4">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 sm:px-5 py-1 sm:py-2 rounded-xl transition-all duration-300 text-xs sm:text-sm flex items-center gap-2 ${
                currentPage === 1
                  ? "bg-gray-800/50 text-gray-500 cursor-not-allowed backdrop-blur-sm"
                  : "bg-gradient-to-r from-white to-gray-300 text-black hover:from-gray-100 hover:to-gray-200 shadow-lg"
              }`}
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: "600",
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex space-x-1 sm:space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl transition-all duration-300 text-xs sm:text-sm font-semibold relative overflow-hidden ${
                      currentPage === pageNum
                        ? "bg-gradient-to-br from-white to-gray-300 text-black shadow-lg"
                        : "bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 hover:border-white/50 hover:bg-white/20"
                    }`}
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 sm:px-5 py-1 sm:py-2 rounded-xl transition-all duration-300 text-xs sm:text-sm flex items-center gap-2 ${
                currentPage === totalPages
                  ? "bg-gray-800/50 text-gray-500 cursor-not-allowed backdrop-blur-sm"
                  : "bg-gradient-to-r from-white to-gray-300 text-black hover:from-gray-100 hover:to-gray-200 shadow-lg"
              }`}
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: "600",
              }}
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Photo;