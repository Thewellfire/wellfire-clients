// backend/routes/productRoute.js
import express from "express";
import {
    addProduct,
    listProducts,
    getProduct,
    updateProduct,
    removeProduct
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

// Public routes
productRouter.get("/list", listProducts);
productRouter.get("/:id", getProduct);

// Admin routes
productRouter.post("/add", adminAuth, upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "albumArt", maxCount: 1 },
    { name: "posterImage", maxCount: 1 },
    { name: "galleryImage", maxCount: 1 },
    { name: "demoTrack", maxCount: 1 },
    { name: "fullTrack", maxCount: 1 },
]), addProduct);

productRouter.put("/:id", adminAuth, updateProduct);
productRouter.delete("/:id", adminAuth, removeProduct);

export default productRouter;