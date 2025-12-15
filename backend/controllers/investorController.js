// backend/controllers/investorController.js
import Investor from "../models/investorModel.js";
import InvestmentProduct from "../models/investmentProductModel.js";
import Razorpay from "razorpay";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

// Create new investment (initiate payment)
const createInvestment = async(req, res) => {
    try {
        const {
            productId,
            investorName,
            email,
            phone,
            address,
            investmentAmount,
            paymentMethod,
            expectedReturns = 0,
            investmentDuration = "",
        } = req.body;

        // Validate investment product exists and is active
        const product = await InvestmentProduct.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Investment product not found",
            });
        }

        if (!product.isActive || product.productStatus !== "funding") {
            return res.status(400).json({
                success: false,
                message: "This product is not accepting investments currently",
            });
        }

        // Check minimum investment amount
        if (investmentAmount < product.minimumInvestment) {
            return res.status(400).json({
                success: false,
                message: `Minimum investment amount is ₹${product.minimumInvestment}`,
            });
        }

        // Check if investment exceeds remaining amount needed
        const remainingAmount = product.totalBudget - product.currentFunding;
        if (investmentAmount > remainingAmount) {
            return res.status(400).json({
                success: false,
                message: `Investment amount exceeds remaining funding needed. Maximum: ₹${remainingAmount}`,
            });
        }

        // Create investor record
        const investor = new Investor({
            productId,
            investorName,
            email,
            phone,
            address,
            investmentAmount,
            paymentMethod,
            expectedReturns,
            investmentDuration,
            paymentStatus: "pending",
        });

        await investor.save();

        // Initiate payment based on method
        let paymentResponse = {};

        if (paymentMethod === "Razorpay" && razorpayInstance) {
            const options = {
                amount: investmentAmount * 100, // Amount in paise
                currency: "INR",
                receipt: investor._id.toString(),
                notes: {
                    productId: productId,
                    productTitle: product.productTitle,
                    investorEmail: email,
                },
            };

            try {
                const razorpayOrder = await razorpayInstance.orders.create(options);
                paymentResponse = {
                    orderId: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                };

                // Update investor with Razorpay order ID
                investor.transactionId = razorpayOrder.id;
                await investor.save();
            } catch (paymentError) {
                await Investor.findByIdAndDelete(investor._id);
                return res.status(500).json({
                    success: false,
                    message: "Payment initiation failed",
                    error: paymentError.message,
                });
            }
        } else if (paymentMethod === "Stripe") {
            try {
                const { origin } = req.headers;

                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [{
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: `Investment in ${product.productTitle}`,
                                description: `Investment by ${investorName}`,
                            },
                            unit_amount: investmentAmount * 100,
                        },
                        quantity: 1,
                    }],
                    mode: 'payment',
                    success_url: `${origin}/investment/success?session_id={CHECKOUT_SESSION_ID}&investor_id=${investor._id}`,
                    cancel_url: `${origin}/investment/cancel?investor_id=${investor._id}`,
                    metadata: {
                        investorId: investor._id.toString(),
                        productId: productId,
                    },
                });

                paymentResponse = {
                    sessionId: session.id,
                    sessionUrl: session.url,
                };

                investor.transactionId = session.id;
                await investor.save();
            } catch (paymentError) {
                await Investor.findByIdAndDelete(investor._id);
                return res.status(500).json({
                    success: false,
                    message: "Payment session creation failed",
                    error: paymentError.message,
                });
            }
        }

        res.status(201).json({
            success: true,
            message: "Investment created successfully",
            investor: {
                id: investor._id,
                investmentAmount: investor.investmentAmount,
                paymentStatus: investor.paymentStatus,
            },
            payment: paymentResponse,
        });
    } catch (error) {
        console.error("Create investment error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

// Verify Razorpay payment
const verifyRazorpayPayment = async(req, res) => {
    try {
        const { investorId, razorpay_order_id, razorpay_payment_id } = req.body;

        const investor = await Investor.findById(investorId);
        if (!investor) {
            return res.status(404).json({
                success: false,
                message: "Investment record not found",
            });
        }

        // Verify payment with Razorpay
        const order = await razorpayInstance.orders.fetch(razorpay_order_id);

        if (order.status === "paid") {
            // Update investor record
            investor.paymentStatus = "completed";
            investor.paymentDate = new Date();
            investor.transactionId = razorpay_payment_id;
            await investor.save();

            // Update product funding
            const product = await InvestmentProduct.findById(investor.productId);
            if (product) {
                product.currentFunding += investor.investmentAmount;
                await product.save();
            }

            res.json({
                success: true,
                message: "Investment completed successfully",
            });
        } else {
            investor.paymentStatus = "failed";
            await investor.save();

            res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }
    } catch (error) {
        console.error("Verify Razorpay payment error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Payment verification failed",
        });
    }
};

// Verify Stripe payment
const verifyStripePayment = async(req, res) => {
    try {
        const { session_id, investor_id } = req.body;

        const investor = await Investor.findById(investor_id);
        if (!investor) {
            return res.status(404).json({
                success: false,
                message: "Investment record not found",
            });
        }

        // Verify payment with Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === "paid") {
            // Update investor record
            investor.paymentStatus = "completed";
            investor.paymentDate = new Date();
            investor.transactionId = session.payment_intent;
            await investor.save();

            // Update product funding
            const product = await InvestmentProduct.findById(investor.productId);
            if (product) {
                product.currentFunding += investor.investmentAmount;
                await product.save();
            }

            res.json({
                success: true,
                message: "Investment completed successfully",
            });
        } else {
            investor.paymentStatus = "failed";
            await investor.save();

            res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }
    } catch (error) {
        console.error("Verify Stripe payment error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Payment verification failed",
        });
    }
};

// Get all investors for a product (Admin)
const getProductInvestors = async(req, res) => {
    try {
        const { productId } = req.params;
        const {
            page = 1,
                limit = 10,
                status = "completed",
                sortBy = "investmentDate",
                sortOrder = "desc"
        } = req.query;

        const filter = { productId };
        if (status) filter.paymentStatus = status;

        const sort = {};
        sort[sortBy] = sortOrder === "desc" ? -1 : 1;

        const skip = (page - 1) * limit;

        const investors = await Investor.find(filter)
            .populate("productId", "productTitle artistName")
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        const total = await Investor.countDocuments(filter);

        const investmentStats = await Investor.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(productId), paymentStatus: "completed" } },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$investmentAmount" },
                    totalInvestors: { $sum: 1 },
                    averageInvestment: { $avg: "$investmentAmount" },
                    maxInvestment: { $max: "$investmentAmount" },
                    minInvestment: { $min: "$investmentAmount" },
                },
            },
        ]);

        res.json({
            success: true,
            investors,
            stats: investmentStats[0] || {
                totalAmount: 0,
                totalInvestors: 0,
                averageInvestment: 0,
                maxInvestment: 0,
                minInvestment: 0,
            },
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalInvestors: total,
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        console.error("Get product investors error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch investors",
        });
    }
};

// Get investor's investment history
const getInvestorHistory = async(req, res) => {
    try {
        const { email } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        const investments = await Investor.find({ email })
            .populate("productId", "productTitle artistName coverImage productStatus")
            .sort({ investmentDate: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Investor.countDocuments({ email });

        const investmentSummary = await Investor.aggregate([
            { $match: { email, paymentStatus: "completed" } },
            {
                $group: {
                    _id: null,
                    totalInvested: { $sum: "$investmentAmount" },
                    totalInvestments: { $sum: 1 },
                },
            },
        ]);

        res.json({
            success: true,
            investments,
            summary: investmentSummary[0] || {
                totalInvested: 0,
                totalInvestments: 0,
            },
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalInvestments: total,
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        console.error("Get investor history error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch investment history",
        });
    }
};

// Admin: Update investor status
const updateInvestorStatus = async(req, res) => {
    try {
        const { investorId } = req.params;
        const { investmentStatus, notes } = req.body;

        const investor = await Investor.findById(investorId);
        if (!investor) {
            return res.status(404).json({
                success: false,
                message: "Investor not found",
            });
        }

        investor.investmentStatus = investmentStatus;
        if (notes) investor.notes = notes;
        await investor.save();

        res.json({
            success: true,
            message: "Investor status updated successfully",
            investor,
        });
    } catch (error) {
        console.error("Update investor status error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update investor status",
        });
    }
};

// Admin: Get investment analytics
const getInvestmentAnalytics = async(req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.investmentDate = {};
            if (startDate) dateFilter.investmentDate.$gte = new Date(startDate);
            if (endDate) dateFilter.investmentDate.$lte = new Date(endDate);
        }

        // Total investments by status
        const investmentsByStatus = await Investor.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: "$paymentStatus",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$investmentAmount" },
                },
            },
        ]);

        // Monthly investment trends
        const monthlyTrends = await Investor.aggregate([{
                $match: {
                    paymentStatus: "completed",
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$investmentDate" },
                        month: { $month: "$investmentDate" },
                    },
                    totalAmount: { $sum: "$investmentAmount" },
                    totalInvestors: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        // Top investors
        const topInvestors = await Investor.aggregate([{
                $match: {
                    paymentStatus: "completed",
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: "$email",
                    investorName: { $first: "$investorName" },
                    totalInvested: { $sum: "$investmentAmount" },
                    totalInvestments: { $sum: 1 },
                },
            },
            { $sort: { totalInvested: -1 } },
            { $limit: 10 },
        ]);

        // Investment by payment method
        const paymentMethodStats = await Investor.aggregate([{
                $match: {
                    paymentStatus: "completed",
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$investmentAmount" },
                },
            },
        ]);

        res.json({
            success: true,
            analytics: {
                investmentsByStatus,
                monthlyTrends,
                topInvestors,
                paymentMethodStats,
            },
        });
    } catch (error) {
        console.error("Get investment analytics error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch analytics",
        });
    }
};

// Cancel/Refund investment (Admin only)
const cancelInvestment = async(req, res) => {
    try {
        const { investorId } = req.params;
        const { reason } = req.body;

        const investor = await Investor.findById(investorId);
        if (!investor) {
            return res.status(404).json({
                success: false,
                message: "Investment not found",
            });
        }

        if (investor.paymentStatus !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Can only refund completed investments",
            });
        }

        // Update investor status
        investor.paymentStatus = "refunded";
        investor.investmentStatus = "cancelled";
        investor.notes = reason || "Investment cancelled by admin";
        await investor.save();

        // Update product funding
        const product = await InvestmentProduct.findById(investor.productId);
        if (product) {
            product.currentFunding = Math.max(0, product.currentFunding - investor.investmentAmount);
            await product.save();
        }

        res.json({
            success: true,
            message: "Investment refunded successfully",
            investor,
        });
    } catch (error) {
        console.error("Cancel investment error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to cancel investment",
        });
    }
};

export {
    createInvestment,
    verifyRazorpayPayment,
    verifyStripePayment,
    getProductInvestors,
    getInvestorHistory,
    updateInvestorStatus,
    getInvestmentAnalytics,
    cancelInvestment,
};