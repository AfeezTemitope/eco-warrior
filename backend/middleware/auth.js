import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find by email (more reliable with String _id)
        const user = await User.findOne({ email: decoded.email }).select('-password');

        if (!user) {
            console.log('❌ User not found:', decoded.email);
            return res.status(401).json({
                error: 'User not found',
                clearToken: true
            });
        }

        req.user = {
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role
        };

        next();
    } catch (err) {
        console.error('❌ Auth middleware error:', err.message);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        res.status(401).json({ error: 'Invalid token' });
    }
};

export default authMiddleware;