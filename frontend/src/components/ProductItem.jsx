import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const ProductItem = ({
  id,
  image,
  name,
  price,
  category = "",
  subCategory = "",
  description = "",
}) => {
  const { currency } = useContext(ShopContext);

  return (
    <Link to={`/product/${id}`}>
      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 mb-4">
        {/* Mobile Layout - Stacked */}
        <div className="block md:hidden">
          {/* Image */}
          <div className="w-full h-64 bg-gray-100">
            <img
              src={image[0]}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="p-4">
            {/* Category */}
            {category && (
              <p className="text-sm text-gray-500 mb-1">{category}</p>
            )}

            {/* Sub Category */}
            {subCategory && (
              <p className="text-xs text-gray-400 mb-2">{subCategory}</p>
            )}

            {/* Product Name */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>

            {/* Description */}
            {description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {description}
              </p>
            )}

            {/* Price */}
            <p className="text-xl font-bold text-gray-800">
              {currency}
              {price}
            </p>
          </div>
        </div>

        {/* Tablet & Desktop Layout - Side by Side */}
        <div className="hidden md:flex min-h-[150px] lg:min-h-[180px]">
          {/* Left side - Image (50%) */}
          <div className="w-1/2 bg-gray-100">
            <img
              src={image[0]}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right side - Product Details (50%) */}
          <div className="w-1/2 p-6 lg:p-8 flex flex-col justify-center">
            {/* Category */}
            {category && (
              <p className="text-base text-gray-500 mb-2">{category}</p>
            )}

            {/* Sub Category */}
            {subCategory && (
              <p className="text-sm text-gray-400 mb-3">{subCategory}</p>
            )}

            {/* Product Name */}
            <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-3">
              {name}
            </h3>

            {/* Description */}
            {description && (
              <p className="text-base text-gray-600 mb-4 line-clamp-4">
                {description}
              </p>
            )}

            {/* Price */}
            <p className="text-2xl lg:text-3xl font-bold text-gray-800">
              {currency}
              {price}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductItem;
