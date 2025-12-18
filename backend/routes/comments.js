// backend/routes/comments.js
import express from 'express';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    const { post_id, text } = req.body;
    try {
        const comment = new Comment({
            post_id,
            author_id: req.user.userId,
            text
        });
        await comment.save();

        // Return comment with username
        const commentObj = comment.toObject();
        commentObj.username = req.user.username;

        res.status(201).json(commentObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/post/:postId', async (req, res) => {
    try {
        const comments = await Comment.find({ post_id: req.params.postId })
            .sort({ created_at: -1 })
            .lean();

        // Fetch usernames for all comment authors
        const authorIds = [...new Set(comments.map(c => c.author_id))];

        let usernameMap = new Map();
        if (authorIds.length > 0) {
            const users = await User.find({
                _id: { $in: authorIds }
            }).select('_id username').lean();

            usernameMap = new Map(users.map(u => [u._id.toString(), u.username]));
        }

        // Attach usernames to comments
        const commentsWithUsernames = comments.map(comment => ({
            ...comment,
            _id: comment._id.toString(),
            author_id: comment.author_id.toString(),
            username: usernameMap.get(comment.author_id.toString()) || 'eco warrior 🤝'
        }));

        res.json(commentsWithUsernames);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        const post = await Post.findById(comment.post_id);

        if (
            comment.author_id.toString() !== req.user.userId &&
            (post ? post.author_id.toString() !== req.user.userId : true) &&
            req.user.role !== 'admin' &&
            req.user.role !== 'superadmin'
        ) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await comment.deleteOne();
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;