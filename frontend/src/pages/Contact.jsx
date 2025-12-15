import React, { useEffect, useState } from "react";

const Contact = () => {
        const [isMobile, setIsMobile] = useState(false);
        const [file, setFile] = useState(null);

        // Check mobile device
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Form data state
        const [formData, setFormData] = useState({
            name: "",
            stageName: "",
            contact: "",
            email: "",
            industry: "",
            message: "",
        });

        // Mobile-specific states
        const [showMobileKeyboard, setShowMobileKeyboard] = useState(false);
        const [touchStartY, setTouchStartY] = useState(0);
        const [touchEndY, setTouchEndY] = useState(0);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [showSuccess, setShowSuccess] = useState(false);
        const [errors, setErrors] = useState({});
        const [currentStep, setCurrentStep] = useState(1);
        const [showPreview, setShowPreview] = useState(false);
        const [isTyping, setIsTyping] = useState(false);
        const [savedDrafts, setSavedDrafts] = useState([]);

        // Scroll to top when component mounts and setup mobile detection
        useEffect(() => {
            window.scrollTo(0, 0);
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }, []);

        // Auto-save draft functionality
        useEffect(() => {
            const timer = setTimeout(() => {
                if (formData.name || formData.email || formData.message) {
                    const draft = {
                        ...formData,
                        timestamp: new Date().toLocaleString(),
                        id: Date.now(),
                    };
                    const existingDrafts = JSON.parse(
                        localStorage.getItem("contactDrafts") || "[]"
                    );
                    const newDrafts = [draft, ...existingDrafts.slice(0, 2)]; // Keep only 3 drafts
                    localStorage.setItem("contactDrafts", JSON.stringify(newDrafts));
                }
            }, 3000);

            return () => clearTimeout(timer);
        }, [formData]);

        // Load saved drafts on component mount
        useEffect(() => {
            const drafts = JSON.parse(localStorage.getItem("contactDrafts") || "[]");
            setSavedDrafts(drafts);
        }, []);

        const handleChange = (e) => {
            const { name, value } = e.target;
            let filteredValue = value;

            // Name field - only allow alphabets and spaces
            if (name === 'name') {
                filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
            }

            // Contact field - only allow numbers, spaces, +, -, ()
            if (name === 'contact') {
                filteredValue = value.replace(/[^0-9\s+\-()]/g, '');
            }

            setFormData({...formData, [name]: filteredValue });
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 1000);

            // Mobile keyboard detection
            if (isMobile) {
                setShowMobileKeyboard(true);
                setTimeout(() => setShowMobileKeyboard(false), 2000);
            }

            if (errors[name]) {
                setErrors({...errors, [name]: "" });
            }
        };

        // Mobile touch handlers
        const handleTouchStart = (e) => {
            setTouchStartY(e.touches[0].clientY);
        };

        const handleTouchMove = (e) => {
            setTouchEndY(e.touches[0].clientY);
        };

        const handleTouchEnd = () => {
            if (touchStartY - touchEndY > 50) {
                // Swipe up - could be used for navigation
            }
            if (touchEndY - touchStartY > 50) {
                // Swipe down - could be used for navigation
            }
        };

        const handleFileChange = (e) => {
            const selectedFile = e.target.files[0];
            if (selectedFile) {
                // Validate file size (10MB limit)
                if (selectedFile.size > 10 * 1024 * 1024) {
                    alert('File size must be less than 10MB');
                    return;
                }
                setFile(selectedFile);
            }
        };

        const handleSubmit = async(e) => {
            e.preventDefault();

            if (!validateForm()) return;

            setIsSubmitting(true);

            try {
                // Send email directly via backend
                await sendEmail();

                // Clear form
                setFormData({
                    name: "",
                    stageName: "",
                    contact: "",
                    email: "",
                    industry: "",
                    message: "",
                });
                setFile(null);

                // Show success message
                setShowSuccess(true);

                // Clear localStorage drafts
                localStorage.removeItem("contactDrafts");
                setSavedDrafts([]);

                // Hide success message after 5 seconds
                setTimeout(() => {
                    setShowSuccess(false);
                }, 5000);
            } catch (error) {
                console.error("Submission error:", error);
                alert('Failed to send application. Please try again later.');
            } finally {
                setIsSubmitting(false);
            }
        };


        const validateForm = () => {
            const newErrors = {};

            // Name validation
            if (!formData.name.trim()) {
                newErrors.name = "Full name is required";
            } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
                newErrors.name = "Name should only contain alphabets and spaces";
            } else if (formData.name.trim().length < 2) {
                newErrors.name = "Name should be at least 2 characters long";
            } else if (formData.name.trim().length > 50) {
                newErrors.name = "Name should not exceed 50 characters";
            }

            // Stage name validation (optional but if provided, should be valid)
            if (formData.stageName && formData.stageName.trim().length > 0) {
                if (formData.stageName.trim().length < 2) {
                    newErrors.stageName = "Stage name should be at least 2 characters long";
                } else if (formData.stageName.trim().length > 30) {
                    newErrors.stageName = "Stage name should not exceed 30 characters";
                }
            }

            // Contact validation
            if (!formData.contact.trim()) {
                newErrors.contact = "Contact number is required";
            } else if (!/^\+?[\d\s\-()]{10,15}$/.test(formData.contact.trim())) {
                newErrors.contact = "Please enter a valid phone number (10-15 digits)";
            }

            // Email validation
            if (!formData.email.trim()) {
                newErrors.email = "Email address is required";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
                newErrors.email = "Please enter a valid email address";
            } else if (formData.email.trim().length > 100) {
                newErrors.email = "Email address is too long";
            }

            // Message validation
            if (!formData.message.trim()) {
                newErrors.message = "Please tell us about yourself and your goals";
            } else if (formData.message.trim().length < 20) {
                newErrors.message = "Message should be at least 20 characters long";
            } else if (formData.message.trim().length > 1000) {
                newErrors.message = "Message should not exceed 1000 characters";
            }

            // Industry validation (optional but if selected, should be valid)
            if (formData.industry && !['Music', 'Film', 'Dance', 'Comedy', 'Theater', 'Content', 'Writing', 'Photography', 'Other'].includes(formData.industry)) {
                newErrors.industry = "Please select a valid industry";
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        const sendEmail = async() => {
                const backendUrl =
                    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

                // Prepare attachments if file is selected
                let attachments = [];
                if (file) {
                    const reader = new FileReader();
                    const fileContent = await new Promise((resolve, reject) => {
                        reader.onload = (e) => resolve(e.target.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });

                    // Extract base64 content and remove data URL prefix
                    const base64Content = fileContent.split(',')[1];

                    attachments = [{
                        filename: file.name,
                        content: base64Content,
                        contentType: file.type,
                        size: file.size
                    }];
                }

                const response = await fetch(`${backendUrl}/api/email/send-email`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                        to: 'info.wellfire@gmail.com',
                                        subject: `New Talent Application - ${formData.name}`,
                                        text: `New talent application received:\n\nName: ${formData.name}\nStage Name: ${formData.stageName || "Not provided"}\nPhone: ${formData.contact}\nEmail: ${formData.email}\nIndustry: ${formData.industry || "Not specified"}\n\nMessage:\n${formData.message}\n\nApplication submitted on: ${new Date().toLocaleString()}`,
                                        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #ff4444; padding-bottom: 10px;">
              New Talent Application
            </h2>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Name:</strong> ${formData.name}</p>
              <p><strong>Stage Name:</strong> ${formData.stageName || "Not provided"}</p>
              <p><strong>Phone:</strong> ${formData.contact}</p>
              <p><strong>Email:</strong> ${formData.email}</p>
              <p><strong>Industry:</strong> ${formData.industry || "Not specified"}</p>
            </div>

            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #2d5a2d; margin-top: 0;">Message:</h3>
              <p style="white-space: pre-wrap;">${formData.message}</p>
            </div>
            
            ${file ? `
            <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #721c24; margin-top: 0;">📎 Attached Document:</h3>
              <p><strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
              <p><strong>Application submitted on:</strong> {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date())}</p>
            </div>
          </div>
        `,
        attachments: attachments
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to send email');
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return true;
  };

  const loadDraft = (draft) => {
    setFormData({
      name: draft.name,
      stageName: draft.stageName,
      contact: draft.contact,
      email: draft.email,
      industry: draft.industry,
      message: draft.message,
    });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      const stepOneErrors = {};
      
      // Name validation for step 1
      if (!formData.name.trim()) {
        stepOneErrors.name = "Full name is required";
      } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
        stepOneErrors.name = "Name should only contain alphabets and spaces";
      } else if (formData.name.trim().length < 2) {
        stepOneErrors.name = "Name should be at least 2 characters long";
      }

      // Email validation for step 1
      if (!formData.email.trim()) {
        stepOneErrors.email = "Email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        stepOneErrors.email = "Please enter a valid email address";
      }

      // Contact validation for step 1
      if (!formData.contact.trim()) {
        stepOneErrors.contact = "Contact number is required";
      } else if (!/^\+?[\d\s\-()]{10,15}$/.test(formData.contact.trim())) {
        stepOneErrors.contact = "Please enter a valid phone number (10-15 digits)";
      }

      if (Object.keys(stepOneErrors).length === 0) {
        setCurrentStep(2);
        setErrors({});
      } else {
        setErrors(stepOneErrors);
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleCall = () => {
    window.location.href = "tel:+917506312117";
  };

  const handleWhatsApp = () => {
    const message = `Hi! I'm interested in working with WELLFIRE Entertainment. My name is ${
      formData.name || "[Your Name]"
    }.`;
    window.open(
      `https://wa.me/917506312117?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleQuickEmail = () => {
    window.location.href =
      "mailto:info.wellfire@gmail.com?subject=Quick Inquiry - WELLFIRE Entertainment";
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br bg-black text-white pt-16 md:pt-16 lg:pt-20"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile-specific indicators */}
      {isMobile && (
        <>
          {/* Auto-save Indicator */}
          {isTyping && (
            <div className="fixed bottom-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-full text-sm z-40 flex items-center space-x-2 animate-pulse">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Saving...</span>
            </div>
          )}
          
          {/* Mobile keyboard indicator */}
          {showMobileKeyboard && (
            <div className="fixed top-4 right-4 bg-yellow-600 text-white px-3 py-1 rounded-full text-xs z-40">
              Keyboard Active
            </div>
          )}
        </>
      )}

      {/* Desktop auto-save indicator */}
      {!isMobile && isTyping && (
        <div className="fixed bottom-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-full text-sm z-40 flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Saving draft...</span>
        </div>
      )}

      {/* Mobile-Optimized Header */}
      <div className="bg-black/50 backdrop-blur-sm py-2 sm:py-4 px-2 sm:px-4 lg:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className={`font-black mb-3 bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent ${isMobile ? 'text-xl leading-tight' : 'text-3xl lg:text-5xl'}`}>
            {isMobile ? (
              'JOIN OUR NETWORK'
            ) : (
              'JOIN OUR NETWORK'
            )}
          </h1>
          
          <p className={`text-gray-400 mb-3 ${isMobile ? 'text-xs px-2' : 'text-base'}`}>
            {isMobile ? (
              'Connect with us through our mobile-optimized form'
            ) : (
              'Connect with us through our talent application form'
            )}
          </p>
         
          {/* Mobile-First Contact Info Bar */}
          
        </div>
      </div>

      {/* Saved Drafts Section */}
    
      {/* Form Section */}
      <div className="py-4 sm:py-6 px-2 sm:px-4 lg:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Mobile-Optimized Progress Indicator */}
          <div className={`mb-${isMobile ? '3' : '4'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className={`font-medium text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Step {currentStep} of 2
                </span>
                
                {currentStep === 2 && (
                  <span className>
                    
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`text-gray-400 hover:text-white transition-colors ${isMobile ? 'text-xs' : 'text-sm'}`}
              >
                {showPreview ? "Hide Preview" : "Show Preview"} 
              </button>
            </div>
            <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${isMobile ? 'h-1' : 'h-2'}`}>
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500 relative"
                style={{ width: currentStep === 1 ? "50%" : "100%", height: isMobile ? '4px' : '8px' }}
              >
                <div className={`absolute right-0 top-0 bg-white/30 animate-pulse rounded-full ${isMobile ? 'w-2 h-full' : 'w-4 h-full'}`}></div>
              </div>
            </div>
          </div>

          {/* Mobile-Optimized Preview Panel */}
          {showPreview && (
            <div className={`mb-${isMobile ? '3' : '4'} bg-gray-800/20 rounded-xl p-${isMobile ? '2' : '3'} border border-gray-700/30`}>
              <h3 className={`font-semibold mb-${isMobile ? '2' : '2'} ${isMobile ? 'text-sm' : 'text-lg'}`}>
                 Application Preview
              </h3>
              <div className={`space-y-${isMobile ? '1' : '2'} text-gray-300 ${isMobile ? 'text-[11px]' : 'text-sm'}`}>
                <p className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span className="text-right">{formData.name || "Not entered"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Stage Name:</span>
                  <span className="text-right">{formData.stageName || "Not provided"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span className="text-right">{formData.email || "Not entered"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Phone:</span>
                  <span className="text-right">{formData.contact || "Not entered"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Industry:</span>
                  <span className="text-right">{formData.industry || "Not specified"}</span>
                </p>
                <p className="flex justify-start">
                  <span className="font-medium mr-2">Message:</span>
                  <span className="text-right">
                    {formData.message
                      ? `${formData.message.substring(0, 100)}...`
                      : "Not entered"}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className={`bg-gray-800/30 backdrop-blur-sm rounded-xl p-${isMobile ? '3' : '4'} sm:p-4 lg:p-6 border border-gray-700/50 shadow-2xl`}>
            {currentStep === 1 ? (
              /* Step 1: Enhanced Basic Info */
              <div className={`space-y-${isMobile ? '3' : '4'}`}>
                <div className="text-center mb-3">
                  <h2 className={`font-bold mb-2 ${isMobile ? 'text-base' : 'text-xl sm:text-2xl'}`}>
                    Let's Get Started 
                  </h2>
                  <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-base'}`}>
                    Tell us about yourself
                  </p>
                </div>

                <div>
                  <label className={`block font-medium mb-2 text-gray-300 flex items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Full Name <span className="text-red-500 ml-1">*</span>
                    <span className={`ml-2 text-gray-500 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                      (as per official documents)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full legal name (alphabets only)"
                    value={formData.name}
                    onChange={handleChange}
                    pattern="[a-zA-Z\s]+"
                    title="Please enter only alphabets and spaces"
                    minLength="2"
                    maxLength="50"
                    onFocus={() => isMobile && setShowMobileKeyboard(true)}
                    onBlur={() => isMobile && setShowMobileKeyboard(false)}
                    disabled={isSubmitting}
                    className={`w-full bg-gray-700/50 border ${
                      errors.name ? "border-red-500" : "border-gray-600"
                    } text-white px-${isMobile ? '3' : '4'} py-${isMobile ? '3' : '2'} sm:py-3 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300 focus:ring-2 focus:ring-red-500/20 ${isMobile ? 'text-base' : 'text-sm sm:text-base'}`}
                  />
                  {errors.name && (
                    <p className={`text-red-400 mt-1 flex items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <span className="mr-1">⚠️</span> {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block font-medium mb-2 text-gray-300 flex items-center ${isMobile ? 'text-[11px]' : 'text-sm'}`}>
                    Stage/Professional Name
                    <span className={`text-gray-500 ${isMobile ? 'text-[10px]' : 'text-xs'} ml-2`}>
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="stageName"
                    placeholder="e.g., John Artist, DJ Phoenix, MC Thunder"
                    value={formData.stageName}
                    onChange={handleChange}
                    minLength="2"
                    maxLength="30"
                    title="Stage name should be 2-30 characters"
                    onFocus={() => isMobile && setShowMobileKeyboard(true)}
                    onBlur={() => isMobile && setShowMobileKeyboard(false)}
                    disabled={isSubmitting}
                    className={`w-full bg-gray-700/50 border border-gray-600 text-white px-${isMobile ? '3' : '4'} py-${isMobile ? '3' : '2'} sm:py-3 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300 ${isMobile ? 'text-base' : 'text-sm sm:text-base'}`}
                  />
                  {errors.stageName && (
                    <p className={`text-red-400 mt-1 flex items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <span className="mr-1">⚠️</span> {errors.stageName}
                    </p>
                  )}
                  <p className={`text-gray-500 mt-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                    The name you perform or work under professionally
                  </p>
                </div>

                <div className={`grid ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'} gap-${isMobile ? '4' : '6'} sm:gap-6`}>
                  <div>
                    <label className={`block font-medium mb-2 text-gray-300 flex items-center ${isMobile ? 'text-[11px]' : 'text-sm'}`}>
                      Phone Number <span className="text-red-500 ml-1">*</span>
                      <span className={`ml-2 text-gray-500 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                         We'll call
                      </span>
                    </label>
                    <input
                      type="tel"
                      name="contact"
                      placeholder="+91 98765 43210 (numbers only)"
                      value={formData.contact}
                      onChange={handleChange}
                      pattern="[+]?[0-9\s\-()]{10,15}"
                      title="Please enter a valid phone number (10-15 digits)"
                      inputMode="numeric"
                      onFocus={() => isMobile && setShowMobileKeyboard(true)}
                      onBlur={() => isMobile && setShowMobileKeyboard(false)}
                      disabled={isSubmitting}
                      className={`w-full bg-gray-700/50 border ${
                        errors.contact ? "border-red-500" : "border-gray-600"
                      } text-white px-${isMobile ? '3' : '4'} py-${isMobile ? '3' : '2'} sm:py-3 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300 focus:ring-2 focus:ring-red-500/20 ${isMobile ? 'text-base' : 'text-sm sm:text-base'}`}
                    />
                    {errors.contact && (
                      <p className={`text-red-400 mt-1 flex items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        <span className="mr-1">⚠️</span> {errors.contact}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={`block font-medium mb-2 text-gray-300 flex items-center ${isMobile ? 'text-[11px]' : 'text-sm'}`}>
                      Email Address <span className="text-red-500 ml-1">*</span>
                      <span className={`ml-2 text-gray-500 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                         Primary communication
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      maxLength="100"
                      title="Please enter a valid email address"
                      onFocus={() => isMobile && setShowMobileKeyboard(true)}
                      onBlur={() => isMobile && setShowMobileKeyboard(false)}
                      disabled={isSubmitting}
                      className={`w-full bg-gray-700/50 border ${
                        errors.email ? "border-red-500" : "border-gray-600"
                      } text-white px-${isMobile ? '3' : '4'} py-${isMobile ? '3' : '2'} sm:py-3 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300 focus:ring-2 focus:ring-red-500/20 ${isMobile ? 'text-base' : 'text-sm sm:text-base'}`}
                    />
                    {errors.email && (
                      <p className={`text-red-400 mt-1 flex items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        <span className="mr-1">⚠️</span> {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className={`pt-${isMobile ? '3' : '4'}`}>
                  <button
                    onClick={nextStep}
                    className={`w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-${isMobile ? '3' : '2'} sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2 ${isMobile ? 'text-base' : 'text-sm sm:text-base'}`}
                    onTouchStart={() => {
                      if (isMobile && 'vibrate' in navigator) {
                        navigator.vibrate(50);
                      }
                    }}
                  >
                    <span className={isMobile ? 'text-sm' : ''}>Continue to Profile Details</span>
                    <svg
                      className={`w-${isMobile ? '4' : '5'} h-${isMobile ? '4' : '5'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Enhanced Profile Details */
              <div className={`space-y-${isMobile ? '3' : '4'}`}>
                <div className="text-center mb-3">
                  <h2 className={`font-bold mb-2 ${isMobile ? 'text-base' : 'text-xl sm:text-2xl'}`}>Your Profile </h2>
                  <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-base'}`}>
                    Share your background and aspirations with us
                  </p>
                </div>

                <div>
                  <label className={`block font-medium mb-2 text-gray-300 flex items-center ${isMobile ? 'text-[11px]' : 'text-sm'}`}>
                    Industry/Field
                    <span className={`text-gray-500 ${isMobile ? 'text-[10px]' : 'text-xs'} ml-2`}>
                      (Optional)
                    </span>
                    
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full bg-gray-700/50 border border-gray-600 text-white px-${isMobile ? '3' : '4'} py-${isMobile ? '3' : '2'} sm:py-3 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300 ${isMobile ? 'text-base' : 'text-sm sm:text-base'}`}
                    onTouchStart={() => {
                      if (isMobile && 'vibrate' in navigator) {
                        navigator.vibrate(50);
                      }
                    }}
                  >
                    <option value="">Select your primary field</option>
                    <option value="Music">
                       Music (Singer, Musician, Composer)
                    </option>
                    <option value="Film">
                       Film & TV (Actor, Director, Producer)
                    </option>
                    <option value="Dance">
                       Dance (Choreographer, Dancer)
                    </option>
                    <option value="Comedy">
                       Comedy (Stand-up, Comedy Writing)
                    </option>
                    <option value="Theater">
                       Theater (Stage Actor, Playwright)
                    </option>
                    <option value="Content">
                       Content Creation (YouTube, Social Media)
                    </option>
                    <option value="Writing">
                       Writing (Screenwriter, Author)
                    </option>
                    <option value="Photography">
                       Photography/Videography
                    </option>
                    <option value="Other">
                       Other (Please specify in message)
                    </option>
                  </select>
                  <p className={`text-gray-500 mt-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                    Choose the field that best represents your primary talent
                  </p>
                </div>

                <div>
                  <label className={`block font-medium mb-2 text-gray-300 flex items-center ${isMobile ? 'text-[11px]' : 'text-sm'}`}>
                    About You & Your Goals{" "}
                    <span className="text-red-500 ml-1">*</span>
                   
                  </label>
                  <textarea
                    name="message"
                    placeholder="Tell us your story! Include your experience, goals, and what makes you unique (minimum 20 characters)"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => isMobile && setShowMobileKeyboard(true)}
                    onBlur={() => isMobile && setShowMobileKeyboard(false)}
                    rows={isMobile ? "8" : "6"}
                    minLength="20"
                    maxLength="1000"
                    title="Please provide at least 20 characters describing yourself and your goals"
                    disabled={isSubmitting}
                    className={`w-full bg-gray-700/50 border ${
                      errors.message ? "border-red-500" : "border-gray-600"
                    } text-white px-${isMobile ? '3' : '4'} py-${isMobile ? '3' : '2'} sm:py-3 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300 resize-vertical focus:ring-2 focus:ring-red-500/20 ${isMobile ? 'text-base' : 'text-sm sm:text-base'}`}
                  ></textarea>
                  <div className={`flex justify-between items-center mt-1 ${isMobile ? 'flex-col items-start space-y-1' : ''}`}>
                    {errors.message ? (
                      <p className={`text-red-400 flex items-center ${isMobile ? 'text-[11px]' : 'text-sm'}`}>
                        <span className="mr-1">⚠️</span> {errors.message}
                      </p>
                    ) : (
                      <p className={`text-gray-500 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                        Minimum 20 characters • Be detailed and honest
                      </p>
                    )}
                    <span
                      className={`${isMobile ? 'text-[10px]' : 'text-xs'} ${
                        formData.message.length < 20
                          ? "text-red-400"
                          : "text-gray-500"
                      } ${isMobile ? 'self-end' : ''}`}
                    >
                      {formData.message.length}/1000
                    </span>
                  </div>
                </div>

                <div>
                  <label className={`block font-medium mb-2 text-gray-300 flex items-center ${isMobile ? 'text-[11px]' : 'text-sm'}`}>
                    Resume/Portfolio
                    <span className={`text-gray-500 ${isMobile ? 'text-[10px]' : 'text-xs'} ml-2`}>
                      (Highly Recommended)
                    </span>
                   
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mp3,.zip"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`w-full bg-gray-700/30 border-2 border-dashed border-gray-600 hover:border-red-500 text-gray-400 hover:text-white px-${isMobile ? '3' : '4'} sm:px-4 py-${isMobile ? '6' : '8'} sm:py-8 rounded-lg cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-${isMobile ? '2' : '3'} sm:space-y-3 hover:bg-gray-700/50 overflow-hidden`}
                      onTouchStart={() => {
                        if (isMobile && 'vibrate' in navigator) {
                          navigator.vibrate(50);
                        }
                      }}
                    >
                      <div className={`w-${isMobile ? '10' : '12'} h-${isMobile ? '10' : '12'} sm:w-16 sm:h-16 bg-gray-600 rounded-full flex items-center justify-center`}>
                        <svg
                          className={`w-${isMobile ? '5' : '6'} h-${isMobile ? '5' : '6'} sm:w-8 sm:h-8`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <div className="text-center w-full px-2">
                        <p className={`font-medium ${isMobile ? 'text-xs' : 'text-base sm:text-lg'} break-words`}>
                          {file
                            ? "Click to change file"
                            : "Drop your file here or click to browse"}
                        </p>
                        <p className={`text-gray-500 mt-1 ${isMobile ? 'text-[10px]' : 'text-xs sm:text-sm'} break-words`}>
                          PDF, DOC, Images, Videos, Audio, ZIP (Max 10MB)
                        </p>
                        <p className={`text-gray-600 mt-${isMobile ? '1' : '1'} sm:mt-2 ${isMobile ? 'text-[10px]' : 'text-xs'} break-words`}>
                           Portfolio, demo reel, music samples, or resume
                        </p>
                      </div>
                    </label>
                  </div>

                  {file && (
                    <div className={`mt-${isMobile ? '3' : '4'} bg-gray-700/50 rounded-lg p-${isMobile ? '3' : '4'} border border-gray-600 overflow-hidden`}>
                      <div className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-2' : ''} w-full`}>
                        <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                          <div className={`w-${isMobile ? '8' : '10'} h-${isMobile ? '8' : '10'} bg-red-600 rounded-full flex items-center justify-center flex-shrink-0`}>
                            <svg
                              className={`w-${isMobile ? '4' : '5'} h-${isMobile ? '4' : '5'} text-white`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className={`font-medium text-white truncate ${isMobile ? 'text-[11px]' : 'text-sm'} break-all`}>
                              {file.name}
                            </p>
                            <p className={`text-gray-400 ${isMobile ? 'text-[10px]' : 'text-xs'} break-all`}>
                              {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                              {file.type || "Unknown type"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className={`text-red-400 hover:text-red-300 p-${isMobile ? '1' : '2'} rounded-full hover:bg-red-600/20 transition-colors`}
                          title="Remove file"
                          onTouchStart={() => {
                            if (isMobile && 'vibrate' in navigator) {
                              navigator.vibrate(50);
                            }
                          }}
                        >
                          <svg
                            className={`w-${isMobile ? '4' : '5'} h-${isMobile ? '4' : '5'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                  {errors.file && (
                    <p className={`text-red-400 mt-2 flex items-center ${isMobile ? 'text-[11px]' : 'text-sm'}`}>
                      <span className="mr-1">⚠️</span> {errors.file}
                    </p>
                  )}
                </div>

                {/* Social Media Links - New Feature */}
                <div>
                  <label className={`block font-medium mb-2 text-gray-300 flex items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Social Media/Portfolio Links
                    <span className={`text-gray-500 ${isMobile ? 'text-[10px]' : 'text-xs'} ml-2`}>
                      (Optional)
                    </span>
                   
                  </label>
                  <div className={`space-y-${isMobile ? '2' : '2'}`}>
                    <input
                      type="url"
                      placeholder=" YouTube/Spotify profile"
                      disabled={isSubmitting}
                      className={`w-full bg-gray-700/50 border border-gray-600 text-white px-${isMobile ? '3' : '4'} py-${isMobile ? '2' : '2'} rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300 ${isMobile ? 'text-base' : 'text-sm'}`}
                      onFocus={() => isMobile && setShowMobileKeyboard(true)}
                      onBlur={() => isMobile && setShowMobileKeyboard(false)}
                    />
                    <input
                      type="url"
                      placeholder="Instagram handle"
                      disabled={isSubmitting}
                      className={`w-full bg-gray-700/50 border border-gray-600 text-white px-${isMobile ? '3' : '4'} py-${isMobile ? '2' : '2'} rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300 ${isMobile ? 'text-base' : 'text-sm'}`}
                      onFocus={() => isMobile && setShowMobileKeyboard(true)}
                      onBlur={() => isMobile && setShowMobileKeyboard(false)}
                    />
                    <input
                      type="url"
                      placeholder=" LinkedIn/Portfolio website"
                      disabled={isSubmitting}
                      className={`w-full bg-gray-700/50 border border-gray-600 text-white px-${isMobile ? '3' : '4'} py-${isMobile ? '2' : '2'} rounded-lg focus:border-red-500 focus:outline-none transition-all duration-300 ${isMobile ? 'text-base' : 'text-sm'}`}
                      onFocus={() => isMobile && setShowMobileKeyboard(true)}
                      onBlur={() => isMobile && setShowMobileKeyboard(false)}
                    />
                  </div>
                  <p className={`text-gray-500 mt-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                    Add links to your best work and social profiles
                  </p>
                </div>

                <div className={`flex ${isMobile ? 'flex-col' : 'sm:flex-row'} gap-${isMobile ? '2' : '3'} pt-${isMobile ? '3' : '4'} sm:pt-6`}>
                  <button
                    onClick={prevStep}
                    className={`w-full ${isMobile ? '' : 'sm:flex-1'} bg-gray-700 hover:bg-gray-600 text-white py-${isMobile ? '3' : '2'} sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${isMobile ? 'text-base' : 'text-sm sm:text-base'}`}
                    onTouchStart={() => {
                      if (isMobile && 'vibrate' in navigator) {
                        navigator.vibrate(50);
                      }
                    }}
                  >
                    <svg
                      className={`w-${isMobile ? '3' : '4'} h-${isMobile ? '3' : '4'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className={isMobile ? 'text-sm' : ''}>Back</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full ${isMobile ? '' : 'sm:flex-2'} bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-${isMobile ? '3' : '2'} sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-300 transform ${
                      isSubmitting
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105 hover:shadow-xl"
                    } flex items-center justify-center space-x-2 ${isMobile ? 'text-base' : 'text-sm sm:text-base'}`}
                    onTouchStart={() => {
                      if (isMobile && 'vibrate' in navigator) {
                        navigator.vibrate(50);
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className={`animate-spin -ml-1 mr-2 h-${isMobile ? '3' : '4'} w-${isMobile ? '3' : '4'} text-white`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className={isMobile ? 'text-sm' : ''}>Submitting & Sending Email...</span>
                      </>
                    ) : (
                      <>
                        <span className={isMobile ? 'text-sm' : ''}>Submit Profile & Send Email</span>
                        <span className="text-lg"></span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>


      {/* Footer */}
      <div className="bg-black/80 py-8 px-4 sm:px-6 border-t border-gray-800">
        
      </div>
    </div>
  );
};

export default Contact;