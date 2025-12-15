import mongoose from "mongoose";

const investorSchema = new mongoose.Schema({
    // Investor Details
    investorName: { type: String, required: true, trim: true },
    email: { type: String, required: true, match: /^\S+@\S+\.\S+$/ },
    phone: { type: String, required: true },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" }
    },

    // Investment Details
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InvestmentProduct",
        required: true
    },
    investmentAmount: { type: Number, required: true, min: 100 },

    // Payment Details
    paymentMethod: {
        type: String,
        required: true,
        enum: ["UPI", "Card", "NetBanking", "Wallet", "Bank Transfer"]
    },
    paymentStatus: {
        type: String,
        default: "pending",
        enum: ["pending", "completed", "failed", "refunded"]
    },
    transactionId: { type: String, default: "" },
    paymentDate: { type: Date },

    // Investment Terms
    expectedReturns: { type: Number, default: 0 }, // in percentage
    investmentDuration: { type: String, default: "" },

    // Status & Tracking
    investmentStatus: {
        type: String,
        default: "active",
        enum: ["active", "matured", "cancelled", "withdrawn"]
    },

    // Metadata
    investmentDate: { type: Date, default: Date.now },
    notes: { type: String, default: "" }
}, {
    timestamps: true
});

// Index for faster queries
investorSchema.index({ productId: 1, paymentStatus: 1 });
investorSchema.index({ email: 1 });

const Investor = mongoose.models.Investor || mongoose.model("Investor", investorSchema);

export default Investor;