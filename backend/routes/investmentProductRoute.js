// backend/routes/investmentProductRoute.js (With Test Routes)
import express from "express";
import {
    addInvestmentProduct,
    getFundingAnalytics,
    getInvestmentProduct,
    listInvestmentProducts,
    removeInvestmentProduct,
    updateInvestmentProduct,
    updateFundingProgress,
    updateProductStatus,
    toggleFeatured,
    toggleActive
} from "../controllers/investmentProductController.js";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";
import InvestmentProduct from "../models/investmentProductModel.js";
import { cacheMiddleware } from "../middleware/cache.js";

const investmentProductRouter = express.Router();

// ✅ Test route - No auth, no files
investmentProductRouter.post("/test-basic", (req, res) => {
    console.log("🧪 Test route hit - Body:", req.body);
    res.json({
        success: true,
        message: "Basic test route works!",
        receivedBody: req.body,
        timestamp: new Date().toISOString()
    });
});

// ✅ Test route with auth only
investmentProductRouter.post("/test-auth", adminAuth, (req, res) => {
    console.log("🧪 Auth test route hit - Body:", req.body);
    res.json({
        success: true,
        message: "Auth test route works!",
        receivedBody: req.body,
        timestamp: new Date().toISOString()
    });
});

// ✅ Test route with multer only
investmentProductRouter.post("/test-upload", upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "albumArt", maxCount: 1 }
]), (req, res) => {
    console.log("🧪 Upload test route hit");
    console.log("📝 Body:", req.body);
    console.log("📁 Files:", req.files);
    res.json({
        success: true,
        message: "Upload test route works!",
        receivedBody: req.body,
        receivedFiles: req.files ? Object.keys(req.files) : [],
        timestamp: new Date().toISOString()
    });
});

// Debug middleware
const debugMiddleware = (req, res, next) => {
    console.log(`🔍 ${req.method} ${req.originalUrl}`);
    console.log("📋 Headers token:", req.headers.token ? "Present" : "Missing");
    console.log("📝 Body keys:", Object.keys(req.body));
    console.log("📁 Files keys:", req.files ? Object.keys(req.files) : "No files");
    next();
};

// Public routes with caching (5 minutes for list, 2 minutes for individual)
// Note: Admin uses /list without cache to always get fresh data
investmentProductRouter.get("/list", listInvestmentProducts);
investmentProductRouter.get("/:id", cacheMiddleware(120), getInvestmentProduct);

// Admin routes with extensive debugging
investmentProductRouter.post(
    "/add",
    debugMiddleware,
    adminAuth,
    upload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "albumArt", maxCount: 1 },
        { name: "posterImage", maxCount: 1 },
        { name: "videoThumbnail", maxCount: 1 },
        { name: "galleryImages", maxCount: 10 },
        { name: "videoFile", maxCount: 1 },
        { name: "demoTrack", maxCount: 1 },
        { name: "fullTrack", maxCount: 1 },
    ]),
    (req, res, next) => {
        console.log("🎯 After all middleware - About to call controller");
        console.log("🎯 Final Body:", JSON.stringify(req.body, null, 2));
        console.log("🎯 Final Files:", req.files ? Object.keys(req.files) : "No files");
        next();
    },
    addInvestmentProduct
);

investmentProductRouter.put("/:id", adminAuth, updateInvestmentProduct);
investmentProductRouter.delete("/:id", adminAuth, removeInvestmentProduct);
investmentProductRouter.get("/admin/analytics", adminAuth, getFundingAnalytics);

// Funding Management Routes
investmentProductRouter.put("/:id/funding", adminAuth, updateFundingProgress);
investmentProductRouter.put("/:id/status", adminAuth, updateProductStatus);
investmentProductRouter.put("/:id/featured", adminAuth, toggleFeatured);
investmentProductRouter.put("/:id/active", adminAuth, toggleActive);

export default investmentProductRouter;