import express from 'express';
import Comment from '../models/Comment.js';
import authMiddleware from '../middleware/auth.js';
import Post from '../models/Post.js';
const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    const { post_id, text } = req.body;
    try {
        const comment = new Comment({ post_id, author_id: req.user.userId, text });
        await comment.save();
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/post/:postId', async (req, res) => {
    try {
        const comments = await Comment.find({ post_id: req.params.postId }).sort({ created_at: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        const post = await Post.findById(comment.post_id);
        if (req.user.role !== 'superadmin' && (comment.author_id !== req.user.userId && post.author_id !== req.user.userId)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        await comment.deleteOne();
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;