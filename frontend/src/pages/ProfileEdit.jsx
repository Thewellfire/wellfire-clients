import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { FaCamera, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const ProfileEdit = () => {
  const { token, navigate } = useContext(ShopContext);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    profileImage: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!token) {
      navigate('/login');
    } else {
      fetchUserProfile();
    }
  }, [token, navigate]);

  const fetchUserProfile = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { token }
      });
      
      if (response.data.success) {
        const user = response.data.user;
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          bio: user.bio || '',
          profileImage: null
        });
        if (user.profileImage) {
          setImagePreview(user.profileImage);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }
      
      setProfileData(prev => ({
        ...prev,
        profileImage: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      
      // Update profile data
      const profileResponse = await axios.put(`${backendUrl}/api/user/profile`, {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio
      }, {
        headers: { token }
      });

      if (!profileResponse.data.success) {
        throw new Error(profileResponse.data.message);
      }

      // Upload profile image if selected
      if (profileData.profileImage) {
        const formData = new FormData();
        formData.append('profileImage', profileData.profileImage);
        
        const imageResponse = await axios.put(`${backendUrl}/api/user/profile-image`, formData, {
          headers: { 
            token,
            'Content-Type': 'multipart/form-data'
          }
        });

        if (!imageResponse.data.success) {
          throw new Error(imageResponse.data.message);
        }
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/'); 
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: error.response?.data?.message || error.message || 'Failed to update profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Edit Profile
          </h1>
          <p className="text-gray-400">Update your personal information and profile picture</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : (

        <form onSubmit={handleSubmit} className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-gray-700/50 shadow-2xl">
          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
              {errors.general}
            </div>
          )}
          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 border-4 border-gray-600 group-hover:border-red-500 transition-colors duration-300">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUser className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300 shadow-lg">
                <FaCamera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-gray-400 text-sm mt-2">Click the camera icon to change your photo</p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
                <FaUser className="w-4 h-4 text-red-400" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg focus:border-red-500 focus:outline-none transition-colors duration-300"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
                <FaEnvelope className="w-4 h-4 text-red-400" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg focus:border-red-500 focus:outline-none transition-colors duration-300"
                placeholder="Enter your email"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
                <FaPhone className="w-4 h-4 text-red-400" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg focus:border-red-500 focus:outline-none transition-colors duration-300"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
                <FaMapMarkerAlt className="w-4 h-4 text-red-400" />
                Address
              </label>
              <input
                type="text"
                name="address"
                value={profileData.address}
                onChange={handleInputChange}
                className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg focus:border-red-500 focus:outline-none transition-colors duration-300"
                placeholder="Enter your address"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Bio
            </label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              rows="4"
              className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg focus:border-red-500 focus:outline-none transition-colors duration-300 resize-vertical"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <FaTimes className="w-4 h-4" />
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className={`flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform ${
                isSubmitting || isLoading
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105 hover:shadow-xl'
              } flex items-center justify-center gap-2`}
            >
              <FaSave className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
        )}
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
          <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white p-8 rounded-2xl shadow-2xl max-w-md mx-auto text-center transform animate-bounce border border-green-500/50">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <svg
                className="w-12 h-12 text-white animate-pulse"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-bold mb-4">
              Profile Updated Successfully!
            </h3>
            <p className="mb-4 text-lg">
              Your profile information has been saved.
            </p>
            <div className="bg-white/20 rounded-lg p-4 mb-4 backdrop-blur-sm">
              <p className="text-sm font-medium">
                Redirecting you back...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileEdit;
