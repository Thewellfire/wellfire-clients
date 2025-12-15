import express from "express";
import {
    createInvestment,
    verifyRazorpayPayment,
    verifyStripePayment,
    getProductInvestors,
    getInvestorHistory,
    updateInvestorStatus,
    getInvestmentAnalytics,
    cancelInvestment,
} from "../controllers/investorController.js";
import adminAuth from "../middleware/adminAuth.js";

const investorRouter = express.Router();

// Public routes - Investment creation and verification
investorRouter.post("/invest", createInvestment);
investorRouter.post("/verify/razorpay", verifyRazorpayPayment);
investorRouter.post("/verify/stripe", verifyStripePayment);

// Public route - Get investor's own history
investorRouter.get("/history/:email", getInvestorHistory);

// Admin routes
investorRouter.get("/product/:productId", adminAuth, getProductInvestors);
investorRouter.put("/:investorId/status", adminAuth, updateInvestorStatus);
investorRouter.get("/admin/analytics", adminAuth, getInvestmentAnalytics);
investorRouter.post("/:investorId/cancel", adminAuth, cancelInvestment);

export default investorRouter;