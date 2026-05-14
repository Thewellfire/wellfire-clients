import mongoose from "mongoose";
import { optimizeDatabase } from "./dbOptimization.js";

const maskMongoUri = (uri) => {
    if (!uri) {
        return uri;
    }

    try {
        const [scheme, rest] = uri.split("//");
        if (!rest || !scheme) {
            return uri;
        }

        const atIndex = rest.indexOf("@");
        if (atIndex === -1) {
            return uri;
        }

        return `${scheme}//****:****@${rest.slice(atIndex + 1)}`;
    } catch (error) {
        return uri;
    }
};

const normalizeMongoUri = (uri) => {
    if (!uri) {
        return uri;
    }

    if (uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://")) {
        return uri;
    }

    return `mongodb+srv://${uri}`;
};

const connectDB = async() => {
    mongoose.connection.on('connected', async() => {
        console.log(" DB Connected");
        // Run database optimizations after connection
        await optimizeDatabase();
    });

    // Connection options for better performance
    const options = {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        compressors: ['zlib']
    };

    // MongoDB URI from environment - don't append database name if it's MongoDB Atlas
    const mongoUriRaw = process.env.MONGODB_URI;
    const mongoUriFallbackRaw = process.env.MONGODB_URI_FALLBACK;
    if (!mongoUriRaw) {
        throw new Error("MONGODB_URI is missing. Set it in your environment before starting the server.");
    }

    // For MongoDB Atlas, the database name should be in the URI already or use default
    const mongoUri = normalizeMongoUri(mongoUriRaw.trim());
    const mongoUriFallback = mongoUriFallbackRaw
        ? normalizeMongoUri(mongoUriFallbackRaw.trim())
        : null;

    try {
        await mongoose.connect(mongoUri, options);
    } catch (error) {
        console.error(`❌ MongoDB connection failed for ${maskMongoUri(mongoUri)}.`);

        const shouldTryFallback =
            error?.code === "ENOTFOUND" &&
            mongoUri.startsWith("mongodb+srv://") &&
            mongoUriFallback;

        if (shouldTryFallback) {
            console.error("❌ DNS SRV lookup failed. Trying fallback MONGODB_URI_FALLBACK if provided.");
            try {
                await mongoose.connect(mongoUriFallback, options);
                return;
            } catch (fallbackError) {
                console.error(`❌ MongoDB fallback connection failed for ${maskMongoUri(mongoUriFallback)}.`);
                throw fallbackError;
            }
        }

        if (error?.code === "ENOTFOUND" && mongoUri.startsWith("mongodb+srv://")) {
            console.error("❌ DNS SRV lookup failed. Verify the cluster hostname in MONGODB_URI or use a standard mongodb:// host list if SRV records aren't available.");
        }

        throw error;
    }
}

export default connectDB;