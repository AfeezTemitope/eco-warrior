import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Sign Up
router.post('/signup', async (req, res) => {
    const { email, password, username } = req.body;

    console.log('📝 Sign-up attempt:', { email, username });

    try {
        if (!email || !password || !username) {
            return res.status(400).json({ error: 'Email, password, and username are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('❌ Email already registered:', email);
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with default role
        const user = new User({
            email,
            password: hashedPassword,
            username: username.trim(),
            role: 'user'
        });

        await user.save();
        console.log('✅ User created:', user._id);

        // Generate JWT token
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET not configured');
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('🔐 Token generated for:', user.email);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error('❌ Sign-up error:', err);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

// Sign In
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    console.log('🔑 Sign-in attempt:', email);

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('❌ Invalid password for:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET not configured');
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('✅ Sign-in successful:', email, 'Role:', user.role);
        console.log('🔐 Token:', token.substring(0, 30) + '...');

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error('❌ Sign-in error:', err);
        res.status(500).json({ error: 'Failed to sign in' });
    }
});

// Get Current User (requires auth)
router.get('/me', async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find by email (more reliable)
        const user = await User.findOne({ email: decoded.email }).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error('❌ Token verification failed:', err.message);
        res.status(401).json({ error: 'Invalid token' });
    }
});
export default router;