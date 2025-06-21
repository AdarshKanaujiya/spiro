import express from 'express'
import { getUserProfile, loginUser, registerUser, resendOtp, resetPassword, updateUserProfile, verifyOtp  } from '../controller/userController.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)  //localhost:4000/api/user/register
userRouter.post('/login', loginUser)
userRouter.post('/reset-password', resetPassword) 
userRouter.put('/update-profile/:userid', authUser ,updateUserProfile)
userRouter.get('/get-profile/:userId', getUserProfile) 
userRouter.post('/verify-otp', verifyOtp);
userRouter.post("/resend-otp", resendOtp);

export default userRouter;