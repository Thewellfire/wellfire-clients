import { useContext, useEffect, useRef, useState } from "react";
import {
  FaBars,
  FaBriefcase,
  FaCog,
  FaDollarSign,
  FaHome,
  FaInfoCircle,
  FaPhone,
  FaSignOutAlt,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";
import { Link, NavLink } from "react-router-dom";

import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { navigate, token, setToken, setCartItems } = useContext(ShopContext);

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
  }, []);

  const navLinks = [
    { to: "/", label: "Home", icon: FaHome },
   
    { to: "/Services", label: "Services", icon: FaCog },
    { to: "/LatestCollection1", label: "Projects", icon: FaBriefcase },
    { to: "/Investors", label: "Investors", icon: FaDollarSign },
    { to: "/contact", label: "Contact Us", icon: FaPhone },
  ];
  return (
    <>
      {/* Navbar */}
      <div className={`fixed top-0 left-0 right-0 z-50 shadow-sm px-6 sm:px-8 md:px-12 py-2 md:py-3 flex items-center justify-between transition-all duration-300 ${
        mobileOpen 
          ? 'bg-black bg-opacity-60 backdrop-blur-xl backdrop-saturate-150' 
          : 'bg-black'
      }`}>
        {/* Logo - Now visible on all screen sizes */}
        <Link to="/" className="flex items-center">
          {/* Show image logo on all screen sizes */}
          <img src={assets.logo} alt="logo" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
        </Link>

        {/* Desktop Links - Simple horizontal layout */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "text-white border-b-2 border-white pb-1"
                    : "text-gray-200 hover:text-gray-400"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Login/Profile - Simple button 
        <div className="hidden md:flex items-center">
          {token ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-100 hover:text-gray-300 transition-colors"
              >
                <FaUserCircle className="w-4 h-4" />
                Account
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2 rounded-lg"
                  >
                    <FaSignOutAlt className="w-3 h-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            >
              Login
            </button>
          )}
        </div>*/}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 text-white hover:bg-gray-800 rounded"
        >
          <FaBars className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-90"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Slide Menu */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-full bg-black text-white z-50 transform transition-transform ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header with Wellfire branding */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-white tracking-wide">Wellfire</span>
           
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 hover:bg-gray-800 rounded"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col p-4">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 px-3 rounded mb-2 ${
                  isActive
                    ? "bg-gray-800 text-white font-bold"
                    : "hover:bg-gray-800 text-gray-300"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}

          {/* Account Section */}
          <div className="border-t border-white border-opacity-30 mt-4 pt-4 bg-white bg-opacity-5 backdrop-blur-sm">
            {token ? (
              <>
                <div className="mb-3 sm:mb-4 px-3 sm:px-4">
                  <div className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4 px-3 sm:px-4 bg-white bg-opacity-15 backdrop-blur-md rounded-lg shadow-lg border border-white border-opacity-30">
                    <FaUserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md" />
                    <span className="text-white font-medium drop-shadow-sm text-sm sm:text-base">
                      Account
                    </span>
                  </div>
                </div>
                <div className="px-3 sm:px-4">
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 sm:gap-4 py-3 sm:py-4 px-3 sm:px-4 bg-red-600 bg-opacity-90 hover:bg-red-700 hover:bg-opacity-95 backdrop-blur-md rounded-lg text-white font-medium shadow-lg transition-all duration-200 border border-red-500 border-opacity-50 hover:shadow-xl"
                  >
                    <FaSignOutAlt className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm" />
                    <span className="drop-shadow-sm text-sm sm:text-base">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="px-3 sm:px-4">
                <button
                  onClick={() => {
                    navigate("/login");
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 sm:gap-4 py-3 sm:py-4 px-3 sm:px-4 bg-red-600 bg-opacity-90 hover:bg-red-700 hover:bg-opacity-95 backdrop-blur-md rounded-lg text-white font-medium shadow-lg transition-all duration-200 border border-red-500 border-opacity-50 hover:shadow-xl"
                >
                  <FaUserCircle className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm" />
                  <span className="drop-shadow-sm text-sm sm:text-base">Login / Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;