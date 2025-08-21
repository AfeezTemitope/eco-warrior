import express from 'express';
import Clap from '../models/Clap.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/add', authMiddleware, async (req, res) => {
    const { post_id } = req.body;
    try {
        const clap = new Clap({ post_id, user_id: req.user.userId });
        await clap.save();
        res.status(201).json(clap);
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ error: 'Already clapped' });
        res.status(500).json({ error: err.message });
    }
});

router.post('/remove', authMiddleware, async (req, res) => {
    const { post_id } = req.body;
    try {
        await Clap.deleteOne({ post_id, user_id: req.user.userId });
        res.json({ message: 'Clap removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/post/:postId', async (req, res) => {
    try {
        const claps = await Clap.countDocuments({ post_id: req.params.postId });
        res.json({ claps });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/user-clapped/:postId', authMiddleware, async (req, res) => {
    try {
        const clap = await Clap.findOne({ post_id: req.params.postId, user_id: req.user.userId });
        res.json({ userClapped: !!clap });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;