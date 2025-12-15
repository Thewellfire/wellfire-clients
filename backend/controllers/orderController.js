// ✅ Updated orderController.js with promoCode, discount, and deliveryCharge support

import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import Razorpay from "razorpay";

const CURRENCY_CODE = "INR";
const DELIVERY_CHARGE = 10;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

// ✅ COD Order
const placeOrder = async(req, res) => {
    try {
        const {
            userId,
            items,
            amount,
            address,
            promoCode = "",
            discount = 0,
            deliveryCharge = 0,
        } = req.body;

        const newOrder = new orderModel({
            userId,
            items,
            address,
            amount,
            discount,
            promoCode,
            deliveryCharge,
            paymentMethod: "COD",
            payment: false,
            date: Date.now(),
        });

        await newOrder.save();
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Order placed via COD" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Stripe Order
const placeOrderStripe = async(req, res) => {
    try {
        const {
            userId,
            items,
            amount,
            address,
            promoCode = "",
            discount = 0,
            deliveryCharge = 0,
        } = req.body;
        const { origin } = req.headers;

        const newOrder = new orderModel({
            userId,
            items,
            address,
            amount,
            discount,
            promoCode,
            deliveryCharge,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now(),
        });

        await newOrder.save();

        const line_items = items.map((item) => ({
            price_data: {
                currency: CURRENCY_CODE,
                product_data: { name: item.name },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        }));

        if (deliveryCharge > 0) {
            line_items.push({
                price_data: {
                    currency: CURRENCY_CODE,
                    product_data: { name: "Delivery Charges" },
                    unit_amount: deliveryCharge * 100,
                },
                quantity: 1,
            });
        }

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: "payment",
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Stripe Verification
const verifyStripe = async(req, res) => {
    const { orderId, success, userId } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Razorpay Order
const placeOrderRazorpay = async(req, res) => {
    if (!razorpayInstance) {
        return res.status(503).json({
            success: false,
            message: "Razorpay not configured",
        });
    }

    try {
        const {
            userId,
            items,
            amount,
            address,
            promoCode = "",
            discount = 0,
            deliveryCharge = 0,
        } = req.body;

        const newOrder = new orderModel({
            userId,
            items,
            address,
            amount,
            discount,
            promoCode,
            deliveryCharge,
            paymentMethod: "Razorpay",
            payment: false,
            date: Date.now(),
        });

        await newOrder.save();

        const options = {
            amount: amount * 100,
            currency: CURRENCY_CODE,
            receipt: newOrder._id.toString(),
        };

        razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.error(error);
                return res
                    .status(500)
                    .json({ success: false, message: error.message });
            }

            res.json({ success: true, order });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Razorpay Verification
const verifyRazorpay = async(req, res) => {
    try {
        const { userId, razorpay_order_id } = req.body;

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

        if (orderInfo.status === "paid") {
            await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true, message: "Payment Successful" });
        } else {
            res.json({ success: false, message: "Payment Failed" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🔐 Admin: All Orders
const allOrders = async(req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 👤 User: My Orders
const userOrders = async(req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId });
        res.json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🛠️ Admin: Update Status
const updateStatus = async(req, res) => {
    try {
        const { orderId, status } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    placeOrder,
    placeOrderStripe,
    verifyStripe,
    placeOrderRazorpay,
    verifyRazorpay,
    allOrders,
    userOrders,
    updateStatus,
};