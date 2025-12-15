import validator from "validator";
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { OAuth2Client } from 'google-auth-library';

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// Route for user login
const loginUser = async(req, res) => {
    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id)
            res.json({ success: true, token })

        } else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for user register
const registerUser = async(req, res) => {
    try {

        const { name, email, password } = req.body;

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for admin login
const adminLogin = async(req, res) => {
    try {

        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Create a proper JWT token with an object payload
            const token = jwt.sign({ admin: email + password },
                process.env.JWT_SECRET, { expiresIn: '7d' } // Token expires in 7 days
            );
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


// Route to get user profile
const getUserProfile = async(req, res) => {
    try {
        const userId = req.body.userId;
        const user = await userModel.findById(userId).select('-password');

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route to update user profile
const updateUserProfile = async(req, res) => {
    try {
        const userId = req.body.userId;
        const { name, phone, address, bio } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;
        if (bio) updateData.bio = bio;

        const user = await userModel.findByIdAndUpdate(
            userId,
            updateData, { new: true }
        ).select('-password');

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Profile updated successfully", user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route to update profile image
const updateProfileImage = async(req, res) => {
    try {
        const userId = req.body.userId;

        if (!req.file) {
            return res.json({ success: false, message: "No image file provided" });
        }

        const imageUrl = req.file.path; // Cloudinary URL

        const user = await userModel.findByIdAndUpdate(
            userId, { profileImage: imageUrl }, { new: true }
        ).select('-password');

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Profile image updated successfully", user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Route for Google OAuth authentication
const googleAuth = async(req, res) => {
    try {
        const { credential } = req.body;

        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // Check if user already exists
        let user = await userModel.findOne({ email });

        if (user) {
            // User exists, log them in
            const token = createToken(user._id);
            res.json({ success: true, token, user: { name: user.name, email: user.email } });
        } else {
            // Create new user
            const newUser = new userModel({
                name,
                email,
                password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for OAuth users
                profileImage: picture || ""
            });

            const savedUser = await newUser.save();
            const token = createToken(savedUser._id);

            res.json({
                success: true,
                token,
                user: { name: savedUser.name, email: savedUser.email },
                isNewUser: true
            });
        }

    } catch (error) {
        console.log('Google Auth Error:', error);
        res.json({ success: false, message: "Google authentication failed" });
    }
};

export { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile, updateProfileImage, googleAuth }