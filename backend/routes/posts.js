import express from 'express';
import Post from '../models/Post.js';
import authMiddleware from '../middleware/auth.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ecowarrior',
        format: async () => 'webp',
    },
});

const upload = multer({ storage });

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ created_at: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    const { title, description, content } = req.body;
    try {
        const image_url = req.file ? req.file.path : undefined;
        const post = new Post({ title, description, content, image_url, author_id: req.user.userId });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (post.author_id !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        await post.deleteOne();
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update post
function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    // ✅ Validate ID format
    if (!id || id === 'undefined' || !isValidUUID(id)) {
        return res.status(400).json({ error: 'Invalid post ID' });
    }

    try {
        const { data } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

        if (!data) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(data);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Failed to load post' });
    }
});
export default router;