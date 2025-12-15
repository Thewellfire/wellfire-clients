import cors from "cors";
import "dotenv/config";
import express from "express";
import multer from "multer"; // Added missing import
import connectCloudinary from "./config/cloudinary.js";
import connectDB from "./config/mongodb.js";
import { cacheMiddleware, clearCache, getCacheStats } from "./middleware/cache.js";
import { responseTime, compressionConfig, optimizeRequest } from "./middleware/performance.js";
import { getPort } from "./utils/portManager.js";

// Routes
import cartRouter from "./routes/cartRoute.js";
import emailRouter from "./routes/emailRoute.js";
import investmentProductRouter from "./routes/investmentProductRoute.js";
import investorRouter from "./routes/investorRoute.js";
import orderRouter from "./routes/orderRoute.js";
import userRouter from "./routes/userRoute.js";

// App Config
const app = express();
const defaultPort = process.env.PORT || 4000;
let port = defaultPort; // Will be updated with available port

// Connect to database and cloud services
connectDB();
connectCloudinary();

// Performance Middlewares - Order matters!
app.use(compressionConfig); // Compress responses
app.use(responseTime); // Track response times
app.use(optimizeRequest); // Add performance headers

// Core Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5180",
        "http://localhost:3000",
        process.env.FRONTEND_URL || "https://wellfire-frontend-oa5j.onrender.com",
        process.env.ADMIN_URL || "https://wellfire-new2.onrender.com",
        "https://wellfire-frontend-oa5j.onrender.com",
        "https://wellfire-new2.onrender.com"
    ],
    credentials: true
}));

// Create uploads directory if it doesn't exist
import fs from 'fs';
import path from 'path';
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("✅ Uploads directory created");
}

// Test route - Add this to verify server is working
app.get("/", cacheMiddleware(60), (req, res) => {
    res.json({
        success: true,
        message: "✅ API Working - Investment Platform Ready",
        timestamp: new Date().toISOString(),
        routes: [
            "/api/user",
            "/api/cart",
            "/api/order",
            "/api/investment-product",
            "/api/investor",
            "/api/email",
            "/api/cache"
        ]
    });
});

// Cache management endpoints
app.get("/api/cache/stats", (req, res) => {
    res.json({
        success: true,
        stats: getCacheStats()
    });
});

app.delete("/api/cache/clear", (req, res) => {
    const pattern = req.query.pattern;
    const cleared = clearCache(pattern);
    res.json({
        success: true,
        message: `Cleared ${cleared.length} cache entries`,
        cleared
    });
});

// API Endpoints
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/investment-product", investmentProductRouter);
app.use("/api/investor", investorRouter);
app.use("/api/email", emailRouter);

// Enhanced error handling
app.use((error, req, res, next) => {
    console.error("Global error handler:", error);

    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: "File too large. Maximum size is 100MB per file.",
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: "Too many files uploaded. Maximum 15 files allowed.",
            });
        }
    }

    res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
    });
});

// 404 handler
app.use("*", (req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        availableRoutes: [
            "GET /",
            "POST /api/user/register",
            "POST /api/user/login",
            "POST /api/user/admin",
            "POST /api/investment-product/add",
            "GET /api/investment-product/list",
            "POST /api/email/send-email",
            "POST /api/email/send-partnership-email"
        ]
    });
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
    console.log(`\n🔄 Received ${signal}. Graceful shutdown...`);
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
};

// Start server with automatic port management
let server;

const startServer = async() => {
    try {
        // Get an available port (will auto-kill existing process or find alternative)
        port = await getPort(defaultPort, {
            autoKill: true, // Automatically kill process on the port if in use
            autoFind: true, // Find alternative port if killing fails
            maxAttempts: 10
        });

        server = app.listen(port, () => {
            console.log(`✅ Investment Platform Server started successfully`);
            console.log(`📍 Server URL: http://localhost:${port}`);
            console.log(`🔗 Test endpoint: http://localhost:${port}/api/investment-product/list`);

            if (port !== defaultPort) {
                console.log(`ℹ️  Note: Server is running on port ${port} instead of ${defaultPort}`);
            }
        });

        server.on('error', (err) => {
            console.error('❌ Unexpected server error:', err);
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Initialize server
startServer();

// Handle process termination
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart