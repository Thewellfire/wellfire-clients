import jwt from 'jsonwebtoken';

const authUser = async(req, res, next) => {
    try {
        const { token } = req.headers;

        if (!token) {
            return res.json({
                success: false,
                message: 'Not Authorized. Please login again'
            });
        }

        // Verify token
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        // Add user id to request body for easy access
        req.body.userId = token_decode.id;
        req.user = token_decode;

        next();

    } catch (error) {
        console.log('User auth error:', error);
        // Provide more specific error messages
        if (error.name === 'JsonWebTokenError') {
            return res.json({
                success: false,
                message: 'Invalid token format. Please login again'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.json({
                success: false,
                message: 'Token expired. Please login again'
            });
        }
        res.json({
            success: false,
            message: error.message || 'Authentication failed'
        });
    }
};

export default authUser;