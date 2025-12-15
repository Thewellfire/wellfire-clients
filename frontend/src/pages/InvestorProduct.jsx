import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const InvestorProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    companyDetail: "",
    expectations: "",
  });

  const [productData, setProductData] = useState(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [countryCode, setCountryCode] = useState("+91");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadError, setUploadError] = useState("");

  // Mobile detection
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
    if (id) {
      fetchProductData();
    }
  }, [id]);

  const fetchProductData = async () => {
    try {
      setIsLoadingProduct(true);
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      const response = await axios.get(
        `${backendUrl}/api/investment-product/list`
      );

      if (response.data.success && response.data.products) {
        const product = response.data.products.find((p) => p._id === id);
        if (product) {
          setProductData(product);
        }
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;

    // Name field - only allow alphabets and spaces
    if (name === 'name') {
      filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    
    // Phone field - only allow numbers
    if (name === 'phone') {
      filteredValue = value.replace(/[^0-9]/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: filteredValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadError("");

    // Validate files
    const maxSize = 10 * 1024 * 1024; // 10MB per file
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (too large - max 10MB)`);
      } else if (!allowedTypes.includes(file.type)) {
        invalidFiles.push(`${file.name} (unsupported file type)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setUploadError(`Invalid files: ${invalidFiles.join(', ')}`);
    }

    // Add valid files to uploaded files (limit to 5 files total)
    setUploadedFiles(prev => {
      const combined = [...prev, ...validFiles];
      if (combined.length > 5) {
        setUploadError("Maximum 5 files allowed");
        return combined.slice(0, 5);
      }
      return combined;
    });
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name should only contain alphabets and spaces";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name should be at least 2 characters long";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Phone number should be 10-15 digits only";
    }

    if (!formData.companyDetail.trim()) {
      newErrors.companyDetail = "Company details are required";
    }

    if (!formData.expectations.trim()) {
      newErrors.expectations = "Please describe your expectations";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const sendEmail = async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
    
    const productInfo = productData
      ? `Product Name: ${productData.productTitle || "Unknown Product"}\nCategory: ${productData.category || "Not specified"}\nArtist: ${productData.artistName || "Unknown Artist"}`
      : `Product ID: ${id || "Not specified"}`;

    // Convert files to base64 for email attachment
    const attachments = [];
    for (const file of uploadedFiles) {
      try {
        const base64Data = await convertFileToBase64(file);
        attachments.push({
          filename: file.name,
          content: base64Data.split(',')[1], // Remove data:mime;base64, prefix
          contentType: file.type,
          size: file.size
        });
      } catch (error) {
        console.error(`Error converting file ${file.name} to base64:`, error);
      }
    }

    const emailData = {
      name: formData.name,
      email: formData.email,
      phone: `${countryCode} ${formData.phone}`,
      website: formData.website || "Not provided",
      companyDetail: formData.companyDetail,
      expectations: formData.expectations,
      productInfo: productInfo,
      attachments: attachments
    };

    const response = await fetch(`${backendUrl}/api/email/send-partnership-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to send email');
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Send email directly via backend with attachments
      await sendEmail();

      // Clear form and files
      setFormData({
        name: "",
        email: "",
        phone: "",
        website: "",
        companyDetail: "",
        expectations: "",
      });
      setUploadedFiles([]);
      setUploadError("");

      // Show success message
      setShowSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Submission error:", error);
      alert('Failed to send email. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-black text-white pt-8 md:pt-12 lg:pt-16">
      <div
        className={`w-full max-w-4xl mx-auto ${
          isMobile ? "px-4 py-8" : "px-6 md:px-8 py-8 lg:py-12"
        }`}
      >
        {/* Header Section */}
        <div className={`text-center ${isMobile ? "mb-10" : "mb-12"}`}>
          <div
            className={`flex items-center justify-center ${
              isMobile ? "flex-col gap-8" : "gap-8 lg:gap-12 mb-6 lg:mb-8"
            }`}
          >
            {/* Mobile: Title First */}
            <div className={isMobile ? "text-center" : "text-left flex-1"}>
              <h1
                className={`font-bold mb-4 ${
                  isMobile
                    ? "text-3xl sm:text-4xl leading-tight"
                    : "text-3xl md:text-4xl lg:text-5xl"
                }`}
              >
                {isMobile ? (
                  <>Join Our Business Partnership</>
                ) : (
                  <>
                    Join Our Business
                    <br />
                    Partnership
                  </>
                )}
              </h1>
              <p
                className={`text-gray-400 ${
                  isMobile ? "text-base sm:text-lg" : "text-lg md:text-xl"
                }`}
              >
                Collaborate, Innovate and Thrive together
              </p>
            </div>

            {/* Partnership Icon */}
            <div
              className={`bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 ${
                isMobile ? "w-24 h-24 sm:w-28 sm:h-28" : "w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36"
              }`}
            >
              <svg
                className={`text-white ${isMobile ? "w-10 h-10 sm:w-12 sm:h-12" : "w-12 h-12 md:w-16 md:h-16 lg:w-18 lg:h-18"}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9V3H13.5L19 8.5V9H21ZM21 11H19V21C19 21.6 18.6 22 18 22H16C15.4 22 15 21.6 15 21V16H13V21C13 21.6 12.6 22 12 22H10C9.4 22 9 21.6 9 21V11H7V21C7 21.6 6.6 22 6 22H4C3.4 22 3 21.6 3 21V11H1V9H21V11Z" />
                <circle cx="6" cy="4" r="2" />
                <circle cx="18" cy="4" r="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className={`text-center ${isMobile ? "mb-8" : "mb-10"}`}>
          <h2
            className={`font-semibold mb-3 ${
              isMobile ? "text-xl sm:text-2xl" : "text-2xl md:text-3xl"
            }`}
          >
            Interested ?
          </h2>
          <p
            className={`text-gray-400 ${
              isMobile ? "text-sm sm:text-base px-4" : "text-base md:text-lg"
            }`}
          >
            Please submit your channel information for review
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`space-y-${isMobile ? "6" : "8"} max-w-3xl mx-auto`}
        >
          {/* Name and Email Row */}
          <div
            className={`grid gap-${isMobile ? "6" : "8"} ${
              isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
            }`}
          >
            <div>
              <input
                type="text"
                name="name"
                placeholder="Name* (alphabets only)"
                value={formData.name}
                onChange={handleChange}
                pattern="[a-zA-Z\s]+"
                title="Please enter only alphabets and spaces"
                disabled={isSubmitting}
                className={`w-full bg-transparent border-2 ${
                  errors.name ? "border-red-500" : "border-gray-600"
                } rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors ${
                  isMobile ? "px-4 py-3.5 text-sm sm:text-base" : "px-5 py-4 text-base"
                }`}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-2 mb-1">{errors.name}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email*"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-transparent border-2 ${
                  errors.email ? "border-red-500" : "border-gray-600"
                } rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors ${
                  isMobile ? "px-4 py-3.5 text-sm sm:text-base" : "px-5 py-4 text-base"
                }`}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-2 mb-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Phone Number Row */}
          <div className={`flex ${isMobile ? "gap-4" : "gap-6"}`}>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className={`bg-transparent border-2 border-gray-600 rounded-lg text-white focus:border-red-500 focus:outline-none transition-colors ${
                isMobile ? "px-3 py-3.5 text-sm sm:text-base w-20" : "px-4 py-4 w-24 text-base"
              }`}
            >
              <option value="+91" className="bg-black">
                +91
              </option>
              <option value="+1" className="bg-black">
                +1
              </option>
              <option value="+44" className="bg-black">
                +44
              </option>
              <option value="+61" className="bg-black">
                +61
              </option>
              <option value="+971" className="bg-black">
                +971
              </option>
            </select>

            <div className="flex-1">
              <input
                type="tel"
                name="phone"
                placeholder="Phone number* (numbers only)"
                value={formData.phone}
                onChange={handleChange}
                pattern="[0-9]{10,15}"
                title="Please enter 10-15 digits only"
                inputMode="numeric"
                className={`w-full bg-transparent border-2 ${
                  errors.phone ? "border-red-500" : "border-gray-600"
                } rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors ${
                  isMobile ? "px-4 py-3.5 text-sm sm:text-base" : "px-5 py-4 text-base"
                }`}
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-2 mb-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Website */}
          <div>
            <input
              type="url"
              name="website"
              placeholder="Website (Optional)"
              value={formData.website}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full bg-transparent border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors ${
                isMobile ? "px-4 py-3.5 text-sm sm:text-base" : "px-5 py-4 text-base"
              }`}
            />
          </div>

          {/* Company Detail */}
          <div>
            <textarea
              name="companyDetail"
              placeholder="Company Detail*"
              value={formData.companyDetail}
              onChange={handleChange}
              rows={isMobile ? "4" : "5"}
              disabled={isSubmitting}
              className={`w-full bg-transparent border-2 ${
                errors.companyDetail ? "border-red-500" : "border-gray-600"
              } rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors resize-vertical ${
                isMobile ? "px-4 py-3.5 text-sm sm:text-base" : "px-5 py-4 text-base"
              }`}
            />
            {errors.companyDetail && (
              <p className="text-red-400 text-sm mt-2 mb-1">
                {errors.companyDetail}
              </p>
            )}
          </div>

          {/* Expectations */}
          <div>
            <textarea
              name="expectations"
              placeholder="What do you expect from this Partnership?*"
              value={formData.expectations}
              onChange={handleChange}
              rows={isMobile ? "4" : "5"}
              disabled={isSubmitting}
              className={`w-full bg-transparent border-2 ${
                errors.expectations ? "border-red-500" : "border-gray-600"
              } rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors resize-vertical ${
                isMobile ? "px-4 py-3.5 text-sm sm:text-base" : "px-5 py-4 text-base"
              }`}
            />
            {errors.expectations && (
              <p className="text-red-400 text-sm mt-2 mb-1">{errors.expectations}</p>
            )}
          </div>

          {/* File Upload Section */}
          <div>
            <label className={`block text-gray-300 mb-3 ${isMobile ? "text-sm sm:text-base" : "text-base"}`}>
              Upload Documents (Optional)
            </label>
            <div className={`border-2 border-dashed border-gray-600 rounded-lg hover:border-red-500 transition-colors ${
              isMobile ? "p-4" : "p-6"
            }`}>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={isSubmitting}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center text-center"
              >
                <svg
                  className={`text-gray-400 mb-2 ${isMobile ? "w-8 h-8" : "w-12 h-12"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 48 48"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  />
                </svg>
                <p className={`text-gray-400 ${isMobile ? "text-sm" : "text-base"}`}>
                  Click to upload or drag and drop
                </p>
                <p className={`text-gray-500 ${isMobile ? "text-xs" : "text-sm"} mt-1`}>
                  PDF, DOC, DOCX, JPG, PNG, GIF, TXT, XLS, XLSX (Max 10MB each, 5 files max)
                </p>
              </label>
            </div>

            {/* Upload Error */}
            {uploadError && (
              <p className="text-red-400 text-sm mt-2">{uploadError}</p>
            )}

            {/* Uploaded Files Display */}
            {uploadedFiles.length > 0 && (
              <div className={`mt-4 space-y-2`}>
                <p className={`text-gray-300 ${isMobile ? "text-sm" : "text-base"}`}>
                  Uploaded Files:
                </p>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between bg-gray-800 rounded-lg ${
                      isMobile ? "p-2" : "p-3"
                    }`}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <svg
                        className={`text-gray-400 flex-shrink-0 ${isMobile ? "w-4 h-4" : "w-5 h-5"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="ml-2 min-w-0 flex-1">
                        <p className={`text-white truncate ${isMobile ? "text-sm" : "text-base"}`}>
                          {file.name}
                        </p>
                        <p className={`text-gray-400 ${isMobile ? "text-xs" : "text-sm"}`}>
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-2 text-red-400 hover:text-red-300 flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className={`text-center ${isMobile ? "pt-6" : "pt-6"}`}>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full transition-all duration-300 transform ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105 hover:shadow-xl active:scale-95"
              } ${
                isMobile ? "px-8 py-4 text-base sm:text-lg w-full max-w-sm sm:max-w-md" : "px-12 py-4 text-base md:text-lg"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4 sm:px-6">
          <div
            className={`bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white rounded-2xl shadow-2xl text-center transform  border border-green-500/50 ${
              isMobile ? "p-6 sm:p-7 max-w-sm mx-auto" : "p-8 md:p-10 max-w-md lg:max-w-lg mx-auto"
            }`}
          >
            <div
              className={`bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm ${
                isMobile ? "w-16 h-16 sm:w-20 sm:h-20 mb-4" : "w-24 h-24 mb-6"
              }`}
            >
              <svg
                className={`text-white  ${
                  isMobile ? "w-8 h-8 sm:w-10 sm:h-10" : "w-14 h-14"
                }`}
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
            <h3
              className={`font-bold mb-3 ${
                isMobile ? "text-xl sm:text-2xl" : "text-2xl md:text-3xl mb-4"
              }`}
            >
              Partnership Application Submitted!
            </h3>
            <p className={`mb-4 ${isMobile ? "text-base sm:text-lg" : "text-lg md:text-xl mb-4"}`}>
              Thank you for your interest in partnering with us!
            </p>
            <div
              className={`bg-white/20 rounded-lg backdrop-blur-sm mb-4 ${
                isMobile ? "p-3 sm:p-4" : "p-4 md:p-5 mb-4"
              }`}
            >
              <p className={`font-medium ${isMobile ? "text-sm sm:text-base" : "text-base md:text-lg"}`}>
                We'll review your application and get back to you soon!
              </p>
            </div>
            <p className={`opacity-90 ${isMobile ? "text-sm sm:text-base" : "text-base md:text-lg"}`}>
              Our team will contact you within{" "}
              <strong>2-3 business days</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorProduct;
