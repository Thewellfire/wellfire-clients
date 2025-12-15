import mongoose from "mongoose";
import { optimizeDatabase } from "./dbOptimization.js";

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
    const mongoUri = process.env.MONGODB_URI;

    // For MongoDB Atlas, the database name should be in the URI already or use default
    // Don't append anything to the URI
    await mongoose.connect(mongoUri, options);
}

export default connectDB;