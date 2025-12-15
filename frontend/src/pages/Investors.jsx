import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Investors = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDesktop, setIsDesktop] = useState(false);
  const itemsPerPage = 8;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();

    // Desktop detection
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear previous errors
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      const response = await axios.get(`${backendUrl}/api/investment-product/list`);
      
      if (response.data.success && response.data.products) {
        // Filter out products with invalid data that might cause issues
        const validProducts = response.data.products.filter(product => 
          product && 
          product.totalBudget > 0 && 
          product.productTitle && 
          product.productTitle.trim() !== ''
        );
        setProducts(validProducts);
        setCurrentPage(1); // Reset to first page when new products are loaded
      } else {
        setProducts([]); // Set empty array instead of error for empty response
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]); // Set empty array to show "Coming Soon" instead of error
      // Only set error for actual connection issues
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError('Unable to connect to server. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const calculateFundingPercentage = (current, total) => {
    if (total <= 0) return 0;
    return Math.min((current / total) * 100, 100);
  };

  const getStatusColor = (status) => {
    const colors = {
      funding: "bg-blue-500",
      "in-production": "bg-orange-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const handleProductClick = (productId) => {
    navigate(`/investorproduct/${productId}`);
  };

  // Pagination logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = isDesktop ? products.slice(startIndex, endIndex) : products;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPagination = () => {
    if (!isDesktop || totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8 mb-4">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
            currentPage === 1
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page =>
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1
            )
            .map((page, index, array) => {
              // Add ellipsis for gaps
              const showEllipsis = index > 0 && page - array[index - 1] > 1;

              return (
                <React.Fragment key={page}>
                  {showEllipsis && (
                    <span className="px-2 py-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      page === currentPage
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
            currentPage === totalPages
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  const ProductCard = ({ product, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative bg-black rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 mb-2 sm:mb-4 cursor-pointer border border-transparent"
      onClick={() => handleProductClick(product._id)}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden h-48 w-full">
        {product.coverImage ? (
          <img
            src={product.coverImage}
            alt={product.productTitle}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 group-hover:brightness-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-800">
            No Image
          </div>
        )}

        {/* Status Badge - Only on Hover */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold text-white shadow-lg ${getStatusColor(
              product.productStatus
            )}`}
          >
            {(product.productStatus || 'funding').toUpperCase()}
          </span>
        </div>

      </div>

      {/* Product Info */}
      <div className="p-1.5 sm:p-2">
        <div className="flex items-start gap-1.5 sm:gap-2 mb-1">
          {/* Video Thumbnail */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
            {product.videoThumbnail || product.coverImage ? (
              <img
                src={product.videoThumbnail || product.coverImage}
                alt={product.productTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Product Title */}
            <h3 
              className="text-white font-['Arial',sans-serif] font-normal text-xs sm:text-sm mb-1 line-clamp-1 tracking-wider"
            >
              {product.productTitle || 'Untitled Project'}
            </h3>
            
            {/* Artist Name */}
            <p className="text-gray-400 font-['Arial',sans-serif] font-normal text-xs mb-1 sm:mb-2 tracking-wide line-clamp-1">
              {product.artistName || 'Unknown Artist'}
            </p>
          </div>
        </div>

        {/* Investment Progress */}
        <div className="mb-1.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Investment Progress</span>
            <span className="text-xs text-gray-300">
              {Math.round(calculateFundingPercentage(
                product.currentFunding || 0,
                product.totalBudget || 1
              ))}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-400 h-1.5 sm:h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(2, calculateFundingPercentage(
                  product.currentFunding || 0,
                  product.totalBudget || 1
                ))}%`,
              }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-green-400 font-normal text-[10px] tracking-wide">
            {formatCurrency(product.currentFunding || 0)}
          </span>
          <span className="text-gray-400">
            of {formatCurrency(product.totalBudget || 0)}
          </span>
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Investment Projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-wider">
              WELLFIRE
            </h1>
            <h2 className="text-xl md:text-2xl text-red-500 mb-4 font-semibold tracking-wide">
              INVESTMENT PROJECTS
            </h2>
            <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-800">
              <p className="text-gray-300 text-lg mb-4">Coming Soon</p>
              <p className="text-gray-400 text-sm mb-4">
                We're preparing exciting investment opportunities for you.
              </p>
              <p className="text-red-400 text-sm mb-4">{error}</p>
            </div>
            <button 
              onClick={fetchProducts}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 font-medium tracking-wide"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-['Arial',sans-serif] text-xs">
      {/* Header */}
      <div className="pt-6 sm:pt-12 pb-3 sm:pb-6 px-4 sm:px-4 md:px-4">
        <div className="max-w-7xl mx-auto text-center sm:text-left">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-yellow-500 hover:text-yellow-400 transition-colors duration-300 cursor-default tracking-wider drop-shadow-lg uppercase"
          >
            Investment Projects
          </motion.h1>
       
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 sm:px-4 md:px-4 pb-6 sm:pb-12">
        <div className="max-w-7xl mx-auto">
          {products.length === 0 ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-lg mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="mb-8">
                   
                  </div>
                  
                  <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 shadow-2xl">
                    <div className="mb-6">
                      <h4 className="text-2xl text-white mb-3 font-bold">Stay tuned !!
                       Launching soon ……</h4>
                      
                    </div>
                    
                  
                    
                    <div className="mt-6 flex justify-center">
                      <div className="flex space-x-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-red-500 rounded-full"
                            animate={{
                              y: [-5, 5, -5],
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
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2 md:gap-3">
              {currentProducts.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          )}

          {/* Pagination - Desktop Only */}
          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default Investors;
