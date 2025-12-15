// backend/controllers/productController.js
import Product from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";

// Add regular product
const addProduct = async(req, res) => {
    try {
        const {
            productTitle,
            description,
            artistName,
            producerName,
            labelName,
            category,
            genre,
            totalBudget,
            minimumInvestment,
            productStatus,
            expectedDuration,
            targetAudience,
            isFeatured,
            isActive,
        } = req.body;

        // Validate required fields
        if (!productTitle || !description || !artistName || !totalBudget || !minimumInvestment) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        // Handle file uploads
        const uploadResults = {};

        try {
            const imageFields = ["coverImage", "albumArt", "posterImage", "galleryImage"];
            const audioFields = ["demoTrack", "fullTrack"];

            // Upload images
            for (const field of imageFields) {
                if (req.files && req.files[field]) {
                    const file = Array.isArray(req.files[field]) ? req.files[field][0] : req.files[field];
                    if (file.path) {
                        const result = await cloudinary.uploader.upload(file.path, {
                            resource_type: "image",
                            folder: "products/images",
                        });
                        uploadResults[field] = result.secure_url;
                    }
                }
            }

            // Upload audio files
            for (const field of audioFields) {
                if (req.files && req.files[field]) {
                    const file = Array.isArray(req.files[field]) ? req.files[field][0] : req.files[field];
                    if (file.path) {
                        const result = await cloudinary.uploader.upload(file.path, {
                            resource_type: "video", // Cloudinary uses video for audio
                            folder: "products/audio",
                        });
                        uploadResults[field] = result.secure_url;
                    }
                }
            }
        } catch (uploadError) {
            return res.status(500).json({
                success: false,
                message: "File upload failed: " + uploadError.message
            });
        }

        // Parse targetAudience if it's a string
        let parsedAudience = [];
        if (targetAudience) {
            try {
                parsedAudience = typeof targetAudience === "string" ? JSON.parse(targetAudience) : targetAudience;
            } catch (error) {
                parsedAudience = [];
            }
        }

        // Create product data object
        const productData = {
            productTitle: productTitle.trim(),
            description: description.trim(),
            artistName: artistName.trim(),
            producerName: producerName ? producerName.trim() : "",
            labelName: labelName ? labelName.trim() : "",
            category: category || "Uncategorized",
            genre: genre || "General",
            totalBudget: Number(totalBudget),
            minimumInvestment: Number(minimumInvestment),
            productStatus: productStatus || "funding",
            expectedDuration: expectedDuration || "",
            targetAudience: parsedAudience,
            isFeatured: isFeatured === "true" || isFeatured === true,
            isActive: isActive === "true" || isActive === true,
            ...uploadResults,
        };

        const product = new Product(productData);
        await product.save();

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product
        });

    } catch (error) {
        console.error("Add product error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// List products
const listProducts = async(req, res) => {
    try {
        const { category, status, featured, active = "true", page = 1, limit = 10 } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (status) filter.productStatus = status;
        if (featured !== undefined) filter.isFeatured = featured === "true";
        if (active !== undefined) filter.isActive = active === "true";

        const skip = (page - 1) * limit;

        const products = await Product.find(filter)
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            products,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalProducts: total,
            }
        });
    } catch (error) {
        console.error("List products error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single product
const getProduct = async(req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update product
const updateProduct = async(req, res) => {
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

        const product = await Product.findByIdAndUpdate(id, updates, { new: true });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove product
const removeProduct = async(req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message: "Product removed successfully"
        });
    } catch (error) {
        console.error("Remove product error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { addProduct, listProducts, getProduct, updateProduct, removeProduct };