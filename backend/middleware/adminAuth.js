import jwt from 'jsonwebtoken'

const adminAuth = async(req, res, next) => {
    try {
        const { token } = req.headers
        if (!token) {
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        // Check if the decoded token has the admin property with correct value
        if (!token_decode.admin || token_decode.admin !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }
        next()
    } catch (error) {
        console.log('Admin auth error:', error)
            // Provide more specific error messages
        if (error.name === 'JsonWebTokenError') {
            return res.json({
                success: false,
                message: 'Invalid admin token format. Please login again'
            })
        }
        if (error.name === 'TokenExpiredError') {
            return res.json({
                success: false,
                message: 'Admin token expired. Please login again'
            })
        }
        res.json({ success: false, message: error.message || 'Admin authentication failed' })
    }
}

export default adminAuth