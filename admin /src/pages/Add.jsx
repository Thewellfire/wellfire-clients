import axios from "axios";
import PropTypes from "prop-types";
import { useState } from "react";
import { toast } from "react-toastify";

// Reusable file upload component
const FileUpload = ({
  field,
  label,
  accept,
  multiple = false,
  required = false,
  files,
  onSingleFile,
  onMultipleFiles,
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          if (multiple) {
            onMultipleFiles(field, e.target.files);
          } else {
            onSingleFile(field, e.target.files[0]);
          }
        }}
        className="hidden"
        id={field}
      />
      <label
        htmlFor={field}
        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <div className="text-center">
          <div className="text-3xl mb-2">📁</div>
          <div className="text-sm text-gray-600">
            {files[field] && files[field].length > 0
              ? `${multiple ? files[field].length : 1} file(s) selected`
              : `Click to upload ${label.toLowerCase()}`}
          </div>
        </div>
      </label>
    </div>
    {files[field] && (
      <div className="text-xs text-gray-500">
        {multiple && Array.isArray(files[field])
          ? `${files[field].length} files selected`
          : `Selected: ${files[field].name}`}
      </div>
    )}
  </div>
);

FileUpload.propTypes = {
  field: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  required: PropTypes.bool,
  files: PropTypes.object.isRequired,
  onSingleFile: PropTypes.func.isRequired,
  onMultipleFiles: PropTypes.func.isRequired,
};

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const AddInvestmentProduct = ({ token }) => {
  // Form states
  const [formData, setFormData] = useState({
    productTitle: "",
    description: "",
    artistName: "",
    producerName: "",
    labelName: "",
    category: "",
    genre: "",
    totalBudget: "",
    minimumInvestment: "",
    expectedDuration: "",
    productStatus: "funding",
    targetAudience: [],
    isFeatured: false,
    isActive: true,
  });

  // File states
  const [files, setFiles] = useState({
    coverImage: null,
    albumArt: null,
    posterImage: null,
    galleryImages: [],
    videoThumbnail: null,
    videoFile: null,
    demoTrack: null,
    fullTrack: null,
  });

  // UI states
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [youtubeLink, setYoutubeLink] = useState("");

  // Options
  const categoryOptions = [
    { value: "Music" },
    { value: "Film" },
    { value: "Commercial" },
    { value: "Documentary" },
    { value: "Web Series" },
    { value: "Upcoming Projects" },
    { value: "Media Production" },
    { value: "Line Production Services" },
    { value: "Government Subsidy Guidance" },
    { value: "Other" },
  ];

  const genreOptions = [
    { value: "Pop" },
    { value: "Rock" },
    { value: "Classical" },
    { value: "Jazz" },
    { value: "Hip-Hop" },
    { value: "Electronic" },
    { value: "Folk" },
    { value: "Country" },
    { value: "R&B" },
    { value: "Indie" },
    { value: "Other" },
  ];

  const statusOptions = [
    { value: "funding", label: "Funding" },
    { value: "in-production", label: "In Production" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const audienceOptions = [
    { value: "Youth" },
    { value: "Adults" },
    { value: "Children" },
    { value: "Seniors" },
    { value: "Global" },
    { value: "Regional" },
  ];

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle file changes
  const handleFileChange = (field, file) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  // Handle multiple file changes
  const handleMultipleFilesChange = (field, files) => {
    setFiles((prev) => ({ ...prev, [field]: Array.from(files) }));
  };

  // Handle target audience selection
  const handleAudienceChange = (audience) => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: prev.targetAudience.includes(audience)
        ? prev.targetAudience.filter((item) => item !== audience)
        : [...prev.targetAudience, audience],
    }));
  };

  // Form validation
  const validateForm = () => {
    const errors = [];

    if (!formData.productTitle.trim()) errors.push("Product title is required");
    if (!formData.description.trim()) errors.push("Description is required");
    if (!formData.artistName.trim()) errors.push("Artist name is required");
    if (!formData.category) errors.push("Category is required");
    if (formData.totalBudget === "" || formData.totalBudget === null || formData.totalBudget === undefined || isNaN(formData.totalBudget) || formData.totalBudget < 0)
      errors.push("Total budget must be a valid number (0 or greater)");
    if (formData.minimumInvestment === "" || formData.minimumInvestment === null || formData.minimumInvestment === undefined || isNaN(formData.minimumInvestment) || formData.minimumInvestment < 0)
      errors.push("Minimum investment must be a valid number (0 or greater)");
    if (
      parseFloat(formData.totalBudget) > 0 && 
      parseFloat(formData.minimumInvestment) > parseFloat(formData.totalBudget)
    ) {
      errors.push("Minimum investment cannot exceed total budget");
    }
    if (!files.coverImage) errors.push("Cover image is required");

    return errors;
  };

  // Submit form
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please login to add products");
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Add form fields
      Object.keys(formData).forEach((key) => {
        if (key === "targetAudience") {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add files
      Object.keys(files).forEach((key) => {
        if (files[key]) {
          if (Array.isArray(files[key])) {
            files[key].forEach((file) => {
              formDataToSend.append(key, file);
            });
          } else {
            formDataToSend.append(key, files[key]);
          }
        }
      });

      // Add YouTube link
      if (youtubeLink) {
        formDataToSend.append("youtubeLink", youtubeLink);
      }

      const response = await axios.post(
        `${backendUrl}/api/investment-product/add`,
        formDataToSend,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Product added successfully!");
        // Reset form
        setFormData({
          productTitle: "",
          description: "",
          artistName: "",
          producerName: "",
          labelName: "",
          category: "",
          genre: "",
          totalBudget: "",
          minimumInvestment: "",
          expectedDuration: "",
          productStatus: "funding",
          targetAudience: [],
          isFeatured: false,
          isActive: true,
        });
        setFiles({
          coverImage: null,
          albumArt: null,
          posterImage: null,
          galleryImages: [],
          videoThumbnail: null,
          videoFile: null,
          demoTrack: null,
          fullTrack: null,
        });
        setYoutubeLink("");
        setCurrentStep(1);
      } else {
        toast.error(
          response.data.message || "Failed to add product. Please try again."
        );
      }
    } catch (error) {
      console.error("Add product error:", error);
      if (error.response?.status === 401) {
        toast.error("Authentication failed. Please login again.");
      } else {
        const apiMessage = error.response?.data?.message;
        toast.error(apiMessage || "Failed to add product. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // File upload component
  const FileUpload = ({
    field,
    label,
    accept,
    multiple = false,
    required = false,
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            if (multiple) {
              handleMultipleFilesChange(field, e.target.files);
            } else {
              handleFileChange(field, e.target.files[0]);
            }
          }}
          className="hidden"
          id={field}
        />
        <label
          htmlFor={field}
          className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <div className="text-center">
            <div className="text-3xl mb-2"></div>
            <div className="text-sm text-gray-600">
              {files[field] && files[field].length > 0
                ? `${multiple ? files[field].length : 1} file(s) selected`
                : `Click to upload ${label.toLowerCase()}`}
            </div>
          </div>
        </label>
      </div>
      {files[field] && (
        <div className="text-xs text-gray-500">
          {multiple && Array.isArray(files[field])
            ? `${files[field].length} files selected`
            : `Selected: ${files[field].name}`}
        </div>
      )}
    </div>
  );

  // Step navigation
  const steps = [
    { number: 1, title: "Basic Info", icon: "📝" },
    { number: 2, title: "Media Assets", icon: "🎵" },
    { number: 3, title: "Funding Details", icon: "💰" },
    { number: 4, title: "Review & Submit", icon: "✅" },
  ];

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Add New Investment Product
            </h1>
            <p className="text-gray-600">
              Create an exciting investment opportunity for your audience
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                    currentStep >= step.number
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  <span className="text-lg">{step.icon}</span>
                </div>
                <div className="ml-3">
                  <div
                    className={`text-sm font-medium ${
                      currentStep >= step.number
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.number ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmitHandler} className="space-y-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Basic Information
                </h2>
                <p className="text-gray-600">
                  Tell us about your product and its creator
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.productTitle}
                    onChange={(e) =>
                      handleInputChange("productTitle", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter product title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Artist Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.artistName}
                    onChange={(e) =>
                      handleInputChange("artistName", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter artist name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Producer Name
                  </label>
                  <input
                    type="text"
                    value={formData.producerName}
                    onChange={(e) =>
                      handleInputChange("producerName", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter producer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Label Name
                  </label>
                  <input
                    type="text"
                    value={formData.labelName}
                    onChange={(e) =>
                      handleInputChange("labelName", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter label name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Genre
                  </label>
                  <select
                    value={formData.genre}
                    onChange={(e) => handleInputChange("genre", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select genre</option>
                    {genreOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Describe your product in detail..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {audienceOptions.map((audience) => (
                      <label
                        key={audience.value}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.targetAudience.includes(
                            audience.value
                          )}
                          onChange={() => handleAudienceChange(audience.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {audience.value}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Media Assets */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Media Assets
                </h2>
                <p className="text-gray-600">
                  Upload images, audio, and video files
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                  field="coverImage"
                  label="Cover Image"
                  accept="image/*"
                  required={true}
                />

                <FileUpload
                  field="albumArt"
                  label="Album Art"
                  accept="image/*"
                />

                <FileUpload
                  field="posterImage"
                  label="Poster Image"
                  accept="image/*"
                />

                <FileUpload
                  field="galleryImages"
                  label="Gallery Images"
                  accept="image/*"
                  multiple={true}
                />

                <FileUpload
                  field="videoThumbnail"
                  label="Video Thumbnail"
                  accept="image/*"
                />

                <FileUpload
                  field="videoFile"
                  label="Video File"
                  accept="video/*"
                />

                <FileUpload
                  field="demoTrack"
                  label="Demo Track"
                  accept="audio/*"
                />

                <FileUpload
                  field="fullTrack"
                  label="Full Track"
                  accept="audio/*"
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    YouTube Link
                  </label>
                  <input
                    type="url"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Funding Details */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Funding Details
                </h2>
                <p className="text-gray-600">
                  Set your funding goals and investment requirements
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Budget (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.totalBudget}
                    onChange={(e) =>
                      handleInputChange("totalBudget", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter total budget (₹0 for free projects)"
                    min="0"
                    step="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set to ₹0 for free projects or promotional content
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Investment (₹){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.minimumInvestment}
                    onChange={(e) =>
                      handleInputChange("minimumInvestment", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter minimum investment (₹0 for no minimum)"
                    min="0"
                    step="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set to ₹0 for free projects or when no minimum investment is required
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expected Duration
                  </label>
                  <input
                    type="text"
                    value={formData.expectedDuration}
                    onChange={(e) =>
                      handleInputChange("expectedDuration", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., 6 months, 1 year"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Status
                  </label>
                  <select
                    value={formData.productStatus}
                    onChange={(e) =>
                      handleInputChange("productStatus", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) =>
                          handleInputChange("isFeatured", e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Feature this product
                      </span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          handleInputChange("isActive", e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Make product active
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Review & Submit
                </h2>
                <p className="text-gray-600">
                  Review your information before submitting
                </p>
              </div>

              <div className="space-y-6">
                {/* Basic Info Review */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Product Title:</span>
                      <div className="font-medium">
                        {formData.productTitle || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Artist Name:</span>
                      <div className="font-medium">
                        {formData.artistName || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <div className="font-medium">
                        {formData.category || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Genre:</span>
                      <div className="font-medium">
                        {formData.genre || "Not provided"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media Review */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Media Assets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Cover Image:</span>
                      <div className="font-medium">
                        {files.coverImage ? "Uploaded" : "Required"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Gallery Images:</span>
                      <div className="font-medium">
                        {files.galleryImages.length > 0
                          ? `${files.galleryImages.length} uploaded`
                          : "None"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Video File:</span>
                      <div className="font-medium">
                        {files.videoFile ? "✅ Uploaded" : "None"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Audio Tracks:</span>
                      <div className="font-medium">
                        {
                          [files.demoTrack, files.fullTrack].filter(Boolean)
                            .length
                        }{" "}
                        uploaded
                      </div>
                    </div>
                  </div>
                </div>

                {/* Funding Review */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Funding Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Budget:</span>
                      <div className="font-medium text-lg text-green-600">
                        {formData.totalBudget !== "" && formData.totalBudget !== null && formData.totalBudget !== undefined
                          ? `₹${formData.totalBudget}`
                          : "Not provided"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Minimum Investment:</span>
                      <div className="font-medium text-lg text-blue-600">
                        {formData.minimumInvestment !== "" && formData.minimumInvestment !== null && formData.minimumInvestment !== undefined
                          ? `₹${formData.minimumInvestment}`
                          : "Not provided"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <div className="font-medium">
                        {formData.productStatus}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Featured:</span>
                      <div className="font-medium">
                        {formData.isFeatured ? "Yes" : "No"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              ← Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Product...</span>
                  </div>
                ) : (
                  "Create Product"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

AddInvestmentProduct.propTypes = {
  token: PropTypes.string.isRequired,
};

export default AddInvestmentProduct;
