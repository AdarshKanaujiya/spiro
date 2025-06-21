import Razorpay from 'razorpay';
import userModel from '../model/userModel.js';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100,
    currency: 'INR',
    receipt: 'receipt_' + Date.now(),
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
};

// New endpoint to handle payment success and clear cart and add purchased courses
export const paymentSuccess = async (req, res) => {
  try {
    const { userId, purchasedCourseIds } = req.body;

    if (!userId || !purchasedCourseIds || !Array.isArray(purchasedCourseIds)) {
      return res.status(400).json({ success: false, message: 'User ID and purchasedCourseIds array are required' });
    }

    // Clear user's cart and add purchased courses
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Merge existing purchasedCourses with new ones, avoiding duplicates
    const updatedPurchasedCourses = Array.from(new Set([...user.purchasedCourses, ...purchasedCourseIds]));

    user.cartData = {};
    user.purchasedCourses = updatedPurchasedCourses;

    await user.save();

    res.status(200).json({ success: true, message: 'Payment successful, cart cleared, and courses added' });
  } catch (error) {
    console.error('Error in payment success:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
