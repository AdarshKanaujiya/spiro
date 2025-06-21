import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    const { token } = req.headers;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not Authorized. Please Login Again' });
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = token_decode.id; // Store userId in req object
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ success: false, message: error.message });
    }
};

export default authUser;