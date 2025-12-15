// backend/controllers/investmentProductController.js (Debug Version)
import { v2 as cloudinary } from "cloudinary";
import InvestmentProduct from "../models/investmentProductModel.js";
import Investor from "../models/investorModel.js";
import { clearCache } from "../middleware/cache.js";

// Add new investment product with extensive debugging
const addInvestmentProduct = async(req, res) => {
    console.log("🚀 Starting addInvestmentProduct function");

    try {
        console.log("📝 Raw Request body:", JSON.stringify(req.body, null, 2));
        console.log("📁 Raw Request files:", req.files ? Object.keys(req.files) : "No files");

        // Check if we have basic required data
        if (!req.body) {
            console.log("❌ No request body found");
            return res.status(400).json({
                success: false,
                message: "No data received in request body"
            });
        }

        let {
            productTitle,
            description,
            artistName,
            producerName,
            labelName,
            category,
            genre,
            totalBudget,
            minimumInvestment,
            expectedDuration,
            productStatus,
            targetAudience,
            isFeatured,
            isActive,
            youtubeLink,
        } = req.body;

        console.log("🔍 Extracted values:");
        console.log("- productTitle:", productTitle);
        console.log("- description:", description);
        console.log("- artistName:", artistName);
        console.log("- totalBudget:", totalBudget);
        console.log("- minimumInvestment:", minimumInvestment);
        console.log("- category:", category);

        // ✅ Validate required fields with detailed logging
        if (!productTitle || productTitle.trim() === "") {
            console.log("❌ Validation failed: Product title is missing or empty");
            return res.status(400).json({
                success: false,
                message: "Product title is required"
            });
        }

        if (!description || description.trim() === "") {
            console.log("❌ Validation failed: Description is missing or empty");
            return res.status(400).json({
                success: false,
                message: "Description is required"
            });
        }

        if (!artistName || artistName.trim() === "") {
            console.log("❌ Validation failed: Artist name is missing or empty");
            return res.status(400).json({
                success: false,
                message: "Artist name is required"
            });
        }

        if (totalBudget === "" || totalBudget === null || totalBudget === undefined || isNaN(totalBudget) || Number(totalBudget) < 0) {
            console.log("❌ Validation failed: Total budget invalid:", totalBudget);
            return res.status(400).json({
                success: false,
                message: "Total budget must be a valid number greater than or equal to 0"
            });
        }

        if (minimumInvestment === "" || minimumInvestment === null || minimumInvestment === undefined || isNaN(minimumInvestment) || Number(minimumInvestment) < 0) {
            console.log("❌ Validation failed: Minimum investment invalid:", minimumInvestment);
            return res.status(400).json({
                success: false,
                message: "Minimum investment must be a valid number greater than or equal to 0"
            });
        }

        console.log("✅ Basic validation passed");

        // ✅ Normalize category to match allowed enum values
        const allowedCategories = new Set(["Music", "Film", "Commercial", "Upcoming Projects", "Documentary", "Web Series", "Media Production", "Line Production Services", "Government Subsidy Guidance", "Other"]);
        const normalizeCategory = (value) => {
            if (!value || typeof value !== "string") return "Other";
            const trimmed = value.trim();
            // Map common variants
            const lower = trimmed.toLowerCase();
            if (lower === "films") return "Film";
            if (lower === "film") return "Film";
            if (lower === "music") return "Music";
            if (lower === "commercial") return "Commercial";
            if (lower === "documentary") return "Documentary";
            if (lower === "web series" || lower === "webseries") return "Web Series";
            if (lower === "upcoming projects" || lower === "upcoming") return "Upcoming Projects";
            // If exact match exists, keep it
            if (allowedCategories.has(trimmed)) return trimmed;
            return "Other";
        };
        category = normalizeCategory(category);
        console.log("🔧 Normalized category:", category);

        // ✅ Parse targetAudience safely
        let parsedAudience = [];
        try {
            if (targetAudience) {
                if (typeof targetAudience === "string") {
                    console.log("🔄 Parsing targetAudience string:", targetAudience);
                    parsedAudience = JSON.parse(targetAudience);
                } else if (Array.isArray(targetAudience)) {
                    console.log("✅ targetAudience is already an array");
                    parsedAudience = targetAudience;
                } else {
                    console.log("⚠️ targetAudience is neither string nor array:", typeof targetAudience);
                    parsedAudience = [];
                }
            }
            console.log("📋 Parsed target audience:", parsedAudience);
        } catch (error) {
            console.log("⚠️ Target audience parsing error:", error.message);
            parsedAudience = [];
        }

        // ✅ Handle file uploads with detailed logging
        const uploadResults = {};

        console.log("📤 Starting file uploads...");

        try {
            // Handle single image uploads
            const imageFields = ["coverImage", "albumArt", "posterImage", "videoThumbnail"];

            for (const field of imageFields) {
                if (req.files && req.files[field]) {
                    console.log(`📤 Processing ${field}...`);
                    const file = Array.isArray(req.files[field]) ?
                        req.files[field][0] :
                        req.files[field];

                    console.log(`📄 File details for ${field}:`, {
                        originalname: file.originalname,
                        mimetype: file.mimetype,
                        size: file.size,
                        path: file.path
                    });

                    if (!file.path) {
                        console.log(`⚠️ No file path for ${field}, skipping...`);
                        continue;
                    }

                    console.log(`☁️ Uploading ${field} to Cloudinary...`);
                    const result = await cloudinary.uploader.upload(file.path, {
                        resource_type: "image",
                        folder: "investment-products/images",
                    });

                    uploadResults[field] = result.secure_url;
                    console.log(`✅ ${field} uploaded successfully: ${result.secure_url}`);
                } else {
                    console.log(`📝 No file provided for ${field}`);
                }
            }

            // Handle multiple gallery images
            if (req.files && req.files["galleryImages"]) {
                console.log("📤 Processing gallery images...");
                const galleryFiles = Array.isArray(req.files["galleryImages"]) ?
                    req.files["galleryImages"] : [req.files["galleryImages"]];

                console.log(`📸 Found ${galleryFiles.length} gallery images`);

                const galleryUrls = [];
                for (const file of galleryFiles) {
                    if (file.path) {
                        console.log(`☁️ Uploading gallery image: ${file.originalname}`);
                        const result = await cloudinary.uploader.upload(file.path, {
                            resource_type: "image",
                            folder: "investment-products/gallery",
                        });
                        galleryUrls.push(result.secure_url);
                        console.log(`✅ Gallery image uploaded: ${result.secure_url}`);
                    }
                }
                uploadResults.galleryImages = galleryUrls;
                console.log(`✅ All gallery images uploaded: ${galleryUrls.length} images`);
            }

            // Handle video file upload
            if (req.files && req.files["videoFile"]) {
                console.log("📤 Processing video file...");
                const videoFile = Array.isArray(req.files["videoFile"]) ?
                    req.files["videoFile"][0] :
                    req.files["videoFile"];

                console.log(`🎥 Video file details:`, {
                    originalname: videoFile.originalname,
                    mimetype: videoFile.mimetype,
                    size: videoFile.size,
                    path: videoFile.path
                });

                if (videoFile.path) {
                    console.log("☁️ Uploading video to Cloudinary...");
                    const result = await cloudinary.uploader.upload(videoFile.path, {
                        resource_type: "video",
                        folder: "investment-products/videos",
                    });
                    uploadResults.videoFile = result.secure_url;
                    console.log(`✅ Video uploaded successfully: ${result.secure_url}`);
                }
            }

            // Handle audio files
            const audioFields = ["demoTrack", "fullTrack"];
            for (const field of audioFields) {
                if (req.files && req.files[field]) {
                    console.log(`📤 Processing ${field}...`);
                    const audioFile = Array.isArray(req.files[field]) ?
                        req.files[field][0] :
                        req.files[field];

                    console.log(`🎵 Audio file details for ${field}:`, {
                        originalname: audioFile.originalname,
                        mimetype: audioFile.mimetype,
                        size: audioFile.size,
                        path: audioFile.path
                    });

                    if (audioFile.path) {
                        console.log(`☁️ Uploading ${field} to Cloudinary...`);
                        const result = await cloudinary.uploader.upload(audioFile.path, {
                            resource_type: "video", // Cloudinary uses video pipeline for audio
                            folder: "investment-products/audio",
                        });
                        uploadResults[field] = result.secure_url;
                        console.log(`✅ ${field} uploaded successfully: ${result.secure_url}`);
                    }
                }
            }

            console.log("✅ All file uploads completed");

        } catch (uploadError) {
            console.error("❌ File upload error:", uploadError);
            return res.status(500).json({
                success: false,
                message: "File upload failed: " + uploadError.message
            });
        }

        // ✅ Construct product data with logging
        // ✅ Normalize genre
        const allowedGenres = new Set(["Pop", "Rock", "Classical", "Jazz", "Hip-Hop", "Electronic", "Folk", "Country", "R&B", "Indie", "Other"]);
        const normalizeGenre = (value) => {
            if (!value || typeof value !== "string") return "Other";
            const trimmed = value.trim();
            if (allowedGenres.has(trimmed)) return trimmed;
            return "Other";
        };
        genre = normalizeGenre(genre);
        console.log("🔧 Normalized genre:", genre);

        const productData = {
            productTitle: productTitle.trim(),
            description: description.trim(),
            artistName: artistName.trim(),
            producerName: producerName ? producerName.trim() : "",
            labelName: labelName ? labelName.trim() : "",
            category: category || "Other",
            genre: genre || "Other",
            totalBudget: Number(totalBudget),
            minimumInvestment: Number(minimumInvestment),
            expectedDuration: expectedDuration || "",
            productStatus: productStatus || "funding",
            targetAudience: parsedAudience,
            isFeatured: isFeatured === "true" || isFeatured === true,
            isActive: isActive === "true" || isActive === true,
            youtubeLink: youtubeLink || "",
            ...uploadResults,
        };

        console.log("💾 Final product data to save:", JSON.stringify(productData, null, 2));

        // ✅ Test database connection
        console.log("🔌 Testing database connection...");
        try {
            const testCount = await InvestmentProduct.countDocuments();
            console.log(`✅ Database connection OK. Current products count: ${testCount}`);
        } catch (dbError) {
            console.error("❌ Database connection error:", dbError);
            return res.status(500).json({
                success: false,
                message: "Database connection failed: " + dbError.message
            });
        }

        // ✅ Create and save product
        console.log("💾 Creating new InvestmentProduct...");
        const product = new InvestmentProduct(productData);

        console.log("💾 Saving product to database...");
        const savedProduct = await product.save();

        console.log("✅ Product saved successfully with ID:", savedProduct._id);

        // Clear cached investment product lists so new product appears immediately
        clearCache("/api/investment-product/list");

        return res.status(201).json({
            success: true,
            message: "Investment product added successfully",
            product: savedProduct,
        });

    } catch (error) {
        console.error("❌ Caught error in addInvestmentProduct:", error);
        console.error("❌ Error stack:", error.stack);

        // More specific error messages
        if (error.name === 'ValidationError') {
            console.error("❌ Mongoose validation error:", error.errors);
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation error: " + errors.join(", "),
                details: error.errors
            });
        }

        if (error.code === 11000) {
            console.error("❌ Duplicate key error:", error.keyPattern);
            return res.status(400).json({
                success: false,
                message: "Product with this title already exists"
            });
        }

        if (error.name === 'CastError') {
            console.error("❌ Cast error:", error);
            return res.status(400).json({
                success: false,
                message: "Invalid data type provided: " + error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
            errorType: error.name || "Unknown Error"
        });
    }
};

// Keep other functions the same...
const listInvestmentProducts = async(req, res) => {
    try {
        const {
            category,
            status,
            featured,
            active,
            page = 1,
            limit = 500,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (status) filter.productStatus = status;
        if (featured !== undefined) filter.isFeatured = featured === "true";
        if (active !== undefined && active !== "") filter.isActive = active === "true";

        console.log("🔍 List products - Filter:", JSON.stringify(filter));
        console.log("🔍 Query params:", req.query);

        const sort = {};
        sort[sortBy] = sortOrder === "desc" ? -1 : 1;

        const skip = (page - 1) * limit;

        const products = await InvestmentProduct.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        console.log("📦 Found products:", products.length);

        const productsWithFunding = await Promise.all(
            products.map(async(product) => {
                const investors = await Investor.find({
                    productId: product._id,
                    paymentStatus: "completed",
                });

                const totalInvestors = investors.length;
                const fundingPercentage = product.fundingPercentage;

                return {
                    ...product.toObject(),
                    fundingPercentage: fundingPercentage.toFixed(1),
                    totalInvestors,
                    remainingAmount: product.remainingAmount,
                    raisedAmount: product.currentFunding,
                };
            })
        );

        const total = await InvestmentProduct.countDocuments(filter);

        // Prevent browser caching so latest data is always fetched
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        res.json({
            success: true,
            products: productsWithFunding,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalProducts: total,
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        console.error("List investment products error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getInvestmentProduct = async(req, res) => {
    try {
        const { id } = req.params;
        const product = await InvestmentProduct.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Investment product not found"
            });
        }

        const investors = await Investor.find({
            productId: id,
            paymentStatus: "completed",
        }).select("investorName investmentAmount investmentDate email");

        const recentInvestments = await Investor.find({
                productId: id,
                paymentStatus: "completed",
            })
            .sort({ investmentDate: -1 })
            .limit(5)
            .select("investorName investmentAmount investmentDate");

        const fundingStats = {
            totalInvestors: investors.length,
            fundingPercentage: product.fundingPercentage.toFixed(1),
            remainingAmount: product.remainingAmount,
            raisedAmount: product.currentFunding,
            averageInvestment: investors.length > 0 ?
                (product.currentFunding / investors.length).toFixed(2) : 0,
        };

        res.json({
            success: true,
            product: {
                ...product.toObject(),
                ...fundingStats,
                recentInvestments,
            },
        });
    } catch (error) {
        console.error("Get investment product error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateInvestmentProduct = async(req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.targetAudience && typeof updates.targetAudience === "string") {
            try {
                updates.targetAudience = JSON.parse(updates.targetAudience);
            } catch (error) {
                updates.targetAudience = [];
            }
        }

        updates.updatedAt = Date.now();

        const product = await InvestmentProduct.findByIdAndUpdate(id, updates, {
            new: true
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Investment product not found"
            });
        }

        // Clear cached lists so updated product data is visible immediately
        clearCache("/api/investment-product/list");

        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        res.json({
            success: true,
            message: "Investment product updated successfully",
            product
        });
    } catch (error) {
        console.error("Update investment product error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeInvestmentProduct = async(req, res) => {
    try {
        const { id } = req.params;

        console.log("🗑️ Permanently deleting product:", id);

        // Check for active investments
        const activeInvestors = await Investor.find({
            productId: id,
            paymentStatus: "completed",
        });

        if (activeInvestors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete product with active investments. Please refund investors first.",
            });
        }

        // Permanently delete all related data
        await Investor.deleteMany({ productId: id });
        const deletedProduct = await InvestmentProduct.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        console.log("✅ Product permanently deleted from database");

        // Clear cached lists so deleted product disappears from all lists
        clearCache("/api/investment-product/list");

        res.json({
            success: true,
            message: "Investment product permanently deleted"
        });
    } catch (error) {
        console.error("Remove investment product error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getFundingAnalytics = async(req, res) => {
    try {
        // Count only active products (not deleted ones)
        const totalProducts = await InvestmentProduct.countDocuments({ isActive: true });
        const activeProducts = await InvestmentProduct.countDocuments({
            isActive: true
        });
        const fundingProducts = await InvestmentProduct.countDocuments({
            productStatus: "funding",
            isActive: true
        });
        const completedProducts = await InvestmentProduct.countDocuments({
            productStatus: "completed",
            isActive: true
        });

        // Calculate total funding from InvestmentProduct currentFunding (more accurate)
        const totalFundingData = await InvestmentProduct.aggregate([
            { $group: { _id: null, total: { $sum: "$currentFunding" } } }
        ]);

        // Also get total from Investor collection for comparison
        const totalInvestments = await Investor.aggregate([
            { $match: { paymentStatus: "completed" } },
            { $group: { _id: null, total: { $sum: "$investmentAmount" } } }
        ]);

        const totalInvestors = await InvestmentProduct.aggregate([
            { $group: { _id: null, total: { $sum: "$totalInvestors" } } }
        ]);

        // Calculate average funding
        const averageFunding = await InvestmentProduct.aggregate([
            { $match: { currentFunding: { $gt: 0 } } },
            { $group: { _id: null, average: { $avg: "$currentFunding" } } }
        ]);

        const categoryStats = await InvestmentProduct.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const fundingProgress = await InvestmentProduct.aggregate([{
                $project: {
                    productTitle: 1,
                    totalBudget: 1,
                    currentFunding: 1,
                    fundingPercentage: {
                        $cond: {
                            if: { $gt: ["$totalBudget", 0] },
                            then: {
                                $multiply: [
                                    { $divide: ["$currentFunding", "$totalBudget"] },
                                    100
                                ]
                            },
                            else: 0
                        }
                    }
                }
            },
            { $sort: { fundingPercentage: -1 } },
            { $limit: 10 }
        ]);

        const totalFundingAmount = totalFundingData.length > 0 ? totalFundingData[0].total : 0;
        const totalInvestorsCount = totalInvestors.length > 0 ? totalInvestors[0].total : 0;
        const averageFundingAmount = averageFunding.length > 0 ? averageFunding[0].average : 0;

        res.json({
            success: true,
            analytics: {
                totalProducts,
                totalFunding: totalFundingAmount,
                activeFunding: fundingProducts,
                completedProjects: completedProducts,
                averageFunding: averageFundingAmount,
                totalInvestors: totalInvestorsCount,
                categoryStats,
                topFundedProjects: fundingProgress,
            },
        });
    } catch (error) {
        console.error("Get funding analytics error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update funding progress
const updateFundingProgress = async(req, res) => {
    try {
        const { id } = req.params;
        const { currentFunding, totalInvestors, fundingDeadline, fundingStatus } = req.body;

        console.log("🔧 Updating funding progress for product:", id);
        console.log("📊 Funding data:", req.body);

        // Validate input
        if (currentFunding < 0) {
            return res.status(400).json({
                success: false,
                message: "Current funding cannot be negative"
            });
        }

        if (totalInvestors < 0) {
            return res.status(400).json({
                success: false,
                message: "Total investors cannot be negative"
            });
        }

        // Get the product to validate against total budget
        const product = await InvestmentProduct.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Investment product not found"
            });
        }

        if (currentFunding > product.totalBudget) {
            return res.status(400).json({
                success: false,
                message: "Current funding cannot exceed total budget"
            });
        }

        // Update the product
        console.log("🔄 Attempting to update product with ID:", id);
        console.log("📝 Update data:", { currentFunding, totalInvestors, fundingDeadline, fundingStatus });

        const updatedProduct = await InvestmentProduct.findByIdAndUpdate(
            id, {
                currentFunding,
                totalInvestors,
                fundingDeadline,
                fundingStatus,
                updatedAt: Date.now()
            }, { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            console.error("❌ Failed to update - product not found or update returned null");
            return res.status(404).json({
                success: false,
                message: "Product not found or update failed"
            });
        }

        console.log("✅ Funding progress updated successfully");
        console.log("📊 Updated product data:", {
            id: updatedProduct._id,
            currentFunding: updatedProduct.currentFunding,
            totalInvestors: updatedProduct.totalInvestors,
            fundingDeadline: updatedProduct.fundingDeadline,
            fundingStatus: updatedProduct.fundingStatus,
            updatedAt: updatedProduct.updatedAt
        });

        // Clear cached lists so updated funding is reflected immediately
        clearCache("/api/investment-product/list");

        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        res.json({
            success: true,
            message: "Funding progress updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.error("Update funding progress error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update funding progress"
        });
    }
};

// Update product status
const updateProductStatus = async(req, res) => {
    try {
        const { id } = req.params;
        const { productStatus } = req.body;

        console.log("🔧 Updating product status for product:", id);
        console.log("📊 New status:", productStatus);

        const validStatuses = ["funding", "in-production", "completed", "cancelled"];
        if (!validStatuses.includes(productStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product status"
            });
        }

        const updatedProduct = await InvestmentProduct.findByIdAndUpdate(
            id, { productStatus, updatedAt: Date.now() }, { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: "Investment product not found"
            });
        }

        console.log("✅ Product status updated successfully");

        // Clear cached lists so status changes are visible immediately
        clearCache("/api/investment-product/list");

        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        res.json({
            success: true,
            message: "Product status updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.error("Update product status error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update product status"
        });
    }
};

// Toggle featured status
const toggleFeatured = async(req, res) => {
    try {
        const { id } = req.params;
        const { isFeatured } = req.body;

        console.log("🔧 Toggling featured status for product:", id);
        console.log("📊 New featured status:", isFeatured);

        const updatedProduct = await InvestmentProduct.findByIdAndUpdate(
            id, { isFeatured, updatedAt: Date.now() }, { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: "Investment product not found"
            });
        }

        console.log("✅ Featured status updated successfully");

        // Clear cached lists so featured flags are updated immediately
        clearCache("/api/investment-product/list");

        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        res.json({
            success: true,
            message: "Featured status updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.error("Toggle featured error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update featured status"
        });
    }
};

// Toggle active status
const toggleActive = async(req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        console.log("🔧 Toggling active status for product:", id);
        console.log("📊 New active status:", isActive);

        const updatedProduct = await InvestmentProduct.findByIdAndUpdate(
            id, { isActive, updatedAt: Date.now() }, { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: "Investment product not found"
            });
        }

        console.log("✅ Active status updated successfully");

        // Clear cached lists so active/inactive changes are reflected immediately
        clearCache("/api/investment-product/list");

        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        res.json({
            success: true,
            message: "Active status updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.error("Toggle active error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update active status"
        });
    }
};

export {
    addInvestmentProduct,
    getFundingAnalytics,
    getInvestmentProduct,
    listInvestmentProducts,
    removeInvestmentProduct,
    toggleActive,
    toggleFeatured,
    updateFundingProgress,
    updateInvestmentProduct,
    updateProductStatus
};