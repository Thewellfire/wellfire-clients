import express from 'express';
import { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile, updateProfileImage, googleAuth } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.post('/google-auth', googleAuth)

// Profile routes (protected)
userRouter.get('/profile', authUser, getUserProfile)
userRouter.put('/profile', authUser, updateUserProfile)
userRouter.put('/profile-image', authUser, upload.single('profileImage'), updateProfileImage)

export default userRouter;