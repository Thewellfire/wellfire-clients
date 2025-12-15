import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
        productTitle: { type: String, required: true, default: "Untitled Project" },
        description: { type: String, required: true, default: "No description provided" },
        artistName: { type: String, required: true, default: "Unknown Artist" },
        producerName: { type: String, default: "" },
        labelName: { type: String, default: "" },

        category: { type: String, required: true, default: "Uncategorized" },
        genre: { type: String, required: true, default: "General" },

        totalBudget: { type: Number, required: true, default: 0 },
        minimumInvestment: { type: Number, required: true, default: 0 },
        currentFunding: { type: Number, default: 0 },
        investorCount: { type: Number, default: 0 },

        productStatus: {
            type: String,
            enum: [
                "funding",
                "pre-production",
                "recording",
                "post-production",
                "marketing",
                "completed",
            ],
            default: "funding",
        },

        expectedDuration: { type: String, default: "" },
        targetAudience: [{ type: String, default: [] }],

        isFeatured: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },

        // Image URLs (stored after upload)
        coverImage: { type: String, default: "" },
        albumArt: { type: String, default: "" },
        posterImage: { type: String, default: "" },
        galleryImage: { type: String, default: "" },

        // Audio file URLs
        demoTrack: { type: String, default: "" },
        fullTrack: { type: String, default: "" },
    }, { timestamps: true } // ✅ replaces createdAt & updatedAt manually
);

const Product = mongoose.model("Product", productSchema);
export default Product;