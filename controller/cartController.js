import userModel from "../model/userModel.js";

// add course to cart
const addToCart = async (req, res) => {
    try {
        const { userId, itemId } = req.body;

        const userData = await userModel.findById(userId);
        let cartData = userData.cartData || {};

        cartData[itemId] = 1; // always set to 1 when adding course

        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({ success: true, message: "Course Added to Cart" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// remove course from cart
const removeFromCart = async (req, res) => {
    try {
        const { userId, itemId } = req.body;

        const userData = await userModel.findById(userId);
        let cartData = userData.cartData || {};

        if (cartData[itemId]) {
            delete cartData[itemId]; // remove course from cart
        }

        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({ success: true, message: "Course Removed from Cart" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// get user cart
const getUserCart = async (req, res) => {
    try {
        const { userId } = req.body;

        const userData = await userModel.findById(userId);
        let cartData = userData.cartData || {};

        res.json({ success: true, cartData });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const clearCart = async (req, res) => {
  try {
    const { userId } = req.body;

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Cart cleared successfully." });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addToCart, removeFromCart, getUserCart, clearCart };

