import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { assets } from "../assets/assets";

const Navbar = ({ setToken }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      setToken("");
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md border-b">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <img className="h-8 w-auto" src={assets.logo} alt="WELLFIRE Logo" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">WELLFIRE</h1>
            <p className="text-xs text-gray-600">Entertainment Admin</p>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          <FaBars className="w-5 h-5" />
        </button>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Time Display */}
          <div className="text-right px-4 py-2 bg-gray-50 rounded-md">
            <p className="text-sm font-semibold text-gray-900">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
            <p className="text-xs text-gray-600">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">Admin User</p>
              <p className="text-xs text-gray-600">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">A</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide Menu */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-xl transform transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <img src={assets.logo} alt="WELLFIRE Logo" className="w-6 h-6" />
              <div>
                <h2 className="font-semibold text-gray-900">WELLFIRE</h2>
                <p className="text-xs text-gray-600">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FaTimes className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Admin Info */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">A</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Admin User</div>
                <div className="text-sm text-gray-600">Administrator</div>
              </div>
            </div>
          </div>

          {/* Time Display */}
          <div className="px-6 py-4 border-b">
            <div className="text-gray-900">
              <div className="font-semibold">
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
              <div className="text-sm text-gray-600">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Logout Button */}
          <div className="px-6 py-4 border-t">
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 rounded-md text-white font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

Navbar.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default Navbar;
