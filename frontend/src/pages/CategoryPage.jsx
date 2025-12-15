import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../components/ProductItem";
import { assets } from "../assets/assets";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const { products } = useContext(ShopContext);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let tempProducts = products.filter(
      (product) =>
        product.category &&
        product.category.toLowerCase() === categoryName.toLowerCase()
    );
    if (searchTerm) {
      tempProducts = tempProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(tempProducts);
    setLoading(false);
  }, [categoryName, products, searchTerm]);

  const formattedCategory =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  return (
    <div className="min-h-screen bg-black px-3 sm:px-0">
      {/* Header Section */}
      <div className="relative bg-gradient-to-b from-gray-900 to-black px-5 sm:px-6 pt-20 sm:pt-8 pb-10 sm:pb-8">
        <div className="text-center space-y-4 sm:space-y-2">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-2"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: "800",
              letterSpacing: "0.1em",
            }}
          >
            {formattedCategory.toUpperCase()}
          </h1>
          <p className="text-gray-400 text-sm sm:text-base px-2 sm:px-0">
            Discover our {formattedCategory.toLowerCase()} collection
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-5 sm:px-6 mb-8 sm:mb-6">
        <div className="relative max-w-md mx-auto space-y-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder={`Search ${formattedCategory.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-4 sm:py-3 text-sm bg-gray-900 text-white border border-gray-700 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg
                className="h-4 w-4 text-gray-400 hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-5 sm:px-6 pb-12 sm:pb-8">
        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-16 px-4">
            <div className="relative mb-6 sm:mb-4">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-red-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-red-400 rounded-full animate-spin animate-reverse"></div>
            </div>
            <p className="text-gray-400 mt-6 sm:mt-4 text-sm px-4 sm:px-0">
              Loading {formattedCategory.toLowerCase()} products...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 sm:py-16 text-center px-4">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-800 rounded-full flex items-center justify-center mb-8 sm:mb-6">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-2 px-2">
              {searchTerm
                ? "No Results Found"
                : `No ${formattedCategory} Products`}
            </h3>
            <p className="text-gray-400 text-sm sm:text-base max-w-sm mb-6 sm:mb-4 px-2 leading-relaxed">
              {searchTerm
                ? `No products match "${searchTerm}". Try a different search term.`
                : `We're working on adding ${formattedCategory.toLowerCase()} products. Check back soon!`}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-8 sm:mt-6 px-8 sm:px-6 py-3 sm:py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* Products Grid */
          <div className="space-y-8 sm:space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 sm:mb-4 px-1">
              <p className="text-gray-400 text-sm leading-relaxed">
                {searchTerm
                  ? `${filteredProducts.length} result${
                      filteredProducts.length !== 1 ? "s" : ""
                    } for "${searchTerm}"`
                  : `${filteredProducts.length} product${
                      filteredProducts.length !== 1 ? "s" : ""
                    } found`}
              </p>
              {isMobile && (
                <div className="flex items-center gap-3 sm:gap-2 text-xs text-gray-500 px-2 py-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  Grid View
                </div>
              )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
              {filteredProducts.map((item, index) => (
                <div
                  key={item._id || index}
                  className="group transform transition-all duration-300 hover:scale-105"
                >
                  <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 p-1 sm:p-0">
                    <ProductItem
                      name={item.name || "No Name"}
                      id={item._id || index}
                      price={item.price || 0}
                      image={item.image || assets.placeholder}
                      rating={item.rating || 0}
                      quantity={item.quantity || 0}
                      subCategory={item.subCategory || ""}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Search Button for Mobile */}
      {isMobile && filteredProducts.length > 6 && (
        <div className="fixed bottom-8 right-5 z-50">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-14 h-14 sm:w-12 sm:h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
