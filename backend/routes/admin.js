import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

const superadminMiddleware = (req, res, next) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ error: 'Superadmin only' });
    }
    next();
};

// Only superadmin can access these routes
router.use(authMiddleware, superadminMiddleware);

// Get all admins except the current superadmin
router.get('/admins', async (req, res) => {
    try {
        const admins = await User.find({
            role: { $in: ['admin', 'superadmin'] }
        }).select('-password');

        // Exclude current superadmin from list
        const filtered = admins
            .filter(a => a._id.toString() !== req.user.userId)
            .map(a => ({
                id: a._id.toString(),
                username: a.username,
                email: a.email,
                role: a.role
            }));

        res.json(filtered);
    } catch (err) {
        console.error('Error fetching admins:', err);
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
});

// Create new admin (superadmin only)
router.post('/admins', async (req, res) => {
    const { email, password, username } = req.body;

    try {
        if (!email || !password || !username) {
            return res.status(400).json({ error: 'Email, password, and username are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new User({
            email,
            password: hashedPassword,
            username: username.trim(),
            role: 'admin'
        });

        await admin.save();

        res.status(201).json({
            id: admin._id.toString(),
            username: admin.username,
            email: admin.email,
            role: admin.role
        });
    } catch (err) {
        console.error('Error creating admin:', err);
        res.status(500).json({ error: 'Failed to create admin' });
    }
});

// Delete admin (superadmin cannot delete themselves or another superadmin)
router.delete('/admins/:id', async (req, res) => {
    try {
        if (req.params.id === req.user.userId) {
            return res.status(403).json({ error: 'Cannot delete self' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        if (user.role === 'superadmin') {
            return res.status(403).json({ error: 'Cannot delete superadmin' });
        }

        await user.deleteOne();
        res.json({ message: 'Admin deleted' });
    } catch (err) {
        console.error('Error deleting admin:', err);
        res.status(500).json({ error: 'Failed to delete admin' });
    }
});

export default router;