// backend/routes/posts.js
import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
dotenv.config();


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
        transformation: [{ width: 1200, height: 675, crop: 'limit' }]
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const router = express.Router();

// Validate MongoDB ObjectId
function isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
}

// GET all posts with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Fetch author profiles from User collection
        const authorIds = [...new Set(posts.map(p => p.author_id))];

        let profileMap = new Map();
        if (authorIds.length > 0) {
            const profiles = await User.find({
                _id: { $in: authorIds }
            }).select('_id username').lean();

            profileMap = new Map(profiles.map(p => [p._id.toString(), p]));
        }

        // Attach profile data to posts
        const postsWithProfiles = posts.map(post => ({
            ...post,
            _id: post._id.toString(),
            author_id: post.author_id.toString(),
            profiles: profileMap.get(post.author_id.toString()) || { username: 'eco warrior 🤝' }
        }));

        res.json(postsWithProfiles);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// GET single post by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid post ID format' });
    }

    try {
        const post = await Post.findById(id).lean();
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Fetch author profile
        const profile = await User.findById(post.author_id).select('_id username').lean();

        const postWithProfile = {
            ...post,
            _id: post._id.toString(),
            author_id: post.author_id.toString(),
            profiles: profile || { username: 'eco warrior 🤝' }
        };

        res.json(postWithProfile);
    } catch (err) {
        console.error('Error fetching post:', err);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// CREATE new post
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    const { title, description, content, image_url } = req.body;

    try {
        if (!title || !description || !content) {
            return res.status(400).json({ error: 'Title, description, and content are required' });
        }

        if (!['admin', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Only admins can create posts' });
        }

        const finalImageUrl = req.file ? req.file.path : image_url;

        const post = new Post({
            title: title.trim(),
            description: description.trim(),
            content: content.trim(),
            image_url: finalImageUrl,
            author_id: req.user.userId
        });

        await post.save();

        const profile = await User.findById(post.author_id).select('_id username').lean();

        const postWithProfile = {
            ...post.toObject(),
            _id: post._id.toString(),
            author_id: post.author_id.toString(),
            profiles: profile || { username: 'eco warrior 🤝' }
        };

        res.status(201).json(postWithProfile);
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// UPDATE post
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, description, content, image_url } = req.body;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid post ID format' });
    }

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        console.log('🔍 Post edit check:', {
            postAuthorId: post.author_id,
            currentUserId: req.user.userId,
            userRole: req.user.role,
            receivedFields: { title: !!title, description: !!description, content: !!content, image: !!req.file }
        });

        // Check if user is author OR admin/superadmin
        const isAuthor = post.author_id === req.user.userId || post.author_id.toString() === req.user.userId;
        const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

        if (!isAuthor && !isAdmin) {
            console.log('❌ Unauthorized edit attempt');
            return res.status(403).json({ error: 'Unauthorized to update this post' });
        }

        console.log('✅ Edit authorized');

        // Only update fields that are provided (partial updates)
        if (title !== undefined && title !== null) {
            post.title = title.trim();
        }
        if (description !== undefined && description !== null) {
            post.description = description.trim();
        }
        if (content !== undefined && content !== null) {
            post.content = content.trim();
        }

        // Handle image updates
        if (req.file) {
            post.image_url = req.file.path;
        } else if (image_url !== undefined) {
            post.image_url = image_url;
        }

        await post.save();

        const profile = await User.findOne({ _id: post.author_id }).select('_id username').lean();

        const postWithProfile = {
            ...post.toObject(),
            _id: post._id.toString(),
            author_id: post.author_id.toString(),
            profiles: profile || { username: 'eco warrior 🤝' }
        };

        console.log('✅ Post updated successfully');
        res.json(postWithProfile);
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({ error: 'Failed to update post' });
    }
});
// DELETE post
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid post ID format' });
    }

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        console.log('🔍 Post delete check:', {
            postAuthorId: post.author_id,
            currentUserId: req.user.userId,
            userRole: req.user.role
        });

        // Check if user is author OR admin/superadmin
        const isAuthor = post.author_id === req.user.userId || post.author_id.toString() === req.user.userId;
        const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

        if (!isAuthor && !isAdmin) {
            console.log('❌ Unauthorized delete attempt');
            return res.status(403).json({ error: 'Unauthorized to delete this post' });
        }

        console.log('✅ Delete authorized');

        await post.deleteOne();
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

export default router;