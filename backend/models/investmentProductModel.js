// backend/models/investmentProductModel.js
import mongoose from "mongoose";

const investmentProductSchema = new mongoose.Schema({
    productTitle: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    artistName: { type: String, required: true },
    producerName: { type: String, default: "" },
    labelName: { type: String, default: "" },
    category: {
        type: String,
        required: true,
        enum: ["Music", "Film", "Commercial", "Upcoming Projects", "Documentary", "Web Series", "Media Production", "Line Production Services", "Government Subsidy Guidance", "Other"]
    },
    genre: {
        type: String,
        default: "Other",
        enum: ["Pop", "Rock", "Classical", "Jazz", "Hip-Hop", "Electronic", "Folk", "Country", "R&B", "Indie", "Other"]
    },

    // Financial Details
    totalBudget: { type: Number, required: true, min: 0 },
    currentFunding: { type: Number, default: 0, min: 0 },
    minimumInvestment: { type: Number, required: true, min: 0 },
    totalInvestors: { type: Number, default: 0, min: 0 },
    fundingDeadline: { type: Date },
    fundingStatus: {
        type: String,
        default: "active",
        enum: ["active", "paused", "completed", "cancelled"]
    },

    // Media Assets
    coverImage: { type: String, default: "" },
    albumArt: { type: String, default: "" },
    posterImage: { type: String, default: "" },
    galleryImages: [{ type: String }], // Array of image URLs

    // Video Assets
    videoThumbnail: { type: String, default: "" }, // Video thumbnail image
    videoFile: { type: String, default: "" }, // Uploaded video file URL
    youtubeLink: { type: String, default: "" }, // YouTube video link

    // Audio Assets
    demoTrack: { type: String, default: "" },
    fullTrack: { type: String, default: "" },

    // Project Details
    expectedDuration: { type: String, default: "" }, // e.g., "3 months"
    productStatus: {
        type: String,
        default: "funding",
        enum: ["funding", "in-production", "completed", "cancelled"]
    },
    targetAudience: [{ type: String }],

    // Admin Controls
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for funding percentage
investmentProductSchema.virtual('fundingPercentage').get(function() {
    if (this.totalBudget <= 0) return 0;
    return Math.min((this.currentFunding / this.totalBudget) * 100, 100);
});

// Virtual for remaining amount
investmentProductSchema.virtual('remainingAmount').get(function() {
    return Math.max(this.totalBudget - this.currentFunding, 0);
});

// Update the updatedAt field before saving
investmentProductSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const InvestmentProduct = mongoose.models.InvestmentProduct ||
    mongoose.model("InvestmentProduct", investmentProductSchema);

export default InvestmentProduct;