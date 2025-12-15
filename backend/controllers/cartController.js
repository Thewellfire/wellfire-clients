import userModel from "../models/userModel.js";

const addToCart = async(req, res) => {
    try {
        const { userId, itemId, size = "default", quantity = 1 } = req.body;

        // ✅ Validate required fields
        if (!userId || !itemId) {
            return res.json({
                success: false,
                message: "User ID and Item ID are required"
            });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        let cartData = userData.cartData || {};

        // Initialize item if not present
        if (!cartData[itemId]) {
            cartData[itemId] = {};
        }

        // Add quantity to the selected size
        if (cartData[itemId][size]) {
            cartData[itemId][size] += Number(quantity);
        } else {
            cartData[itemId][size] = Number(quantity);
        }

        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({ success: true, message: "Added to cart successfully" });
    } catch (error) {
        console.error("Add to cart error:", error);
        res.json({ success: false, message: error.message });
    }
};

const updateCart = async(req, res) => {
    try {
        const { userId, itemId, size, quantity } = req.body;

        if (!userId || !itemId || !size) {
            return res.json({
                success: false,
                message: "Missing required fields"
            });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        let cartData = userData.cartData || {};

        // Handle edge cases
        if (!cartData[itemId]) cartData[itemId] = {};

        if (Number(quantity) > 0) {
            cartData[itemId][size] = Number(quantity);
        } else {
            delete cartData[itemId][size];
            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId];
            }
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Cart Updated" });
    } catch (error) {
        console.error("Update cart error:", error);
        res.json({ success: false, message: error.message });
    }
};

const getUserCart = async(req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.json({
                success: false,
                message: "User ID is required"
            });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        let cartData = userData.cartData || {};

        res.json({ success: true, cartData });
    } catch (error) {
        console.error("Get cart error:", error);
        res.json({ success: false, message: error.message });
    }
};

export { addToCart, updateCart, getUserCart };