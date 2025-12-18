import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import postsRoutes from './routes/posts.js';
import commentsRoutes from './routes/comments.js';
import clapsRoutes from './routes/claps.js';
import seedSuperAdmin from './scripts/seedSuperAdmin.js';
import authMiddleware from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        // Seed superadmin after connection
        return seedSuperAdmin();
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/claps', clapsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// ==================== PRODUCTION: Serve Frontend Build ====================
if (process.env.NODE_ENV === 'production') {
    // ESM equivalent of __dirname
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');

    // Serve static assets (JS, CSS, images, etc.)
    app.use(express.static(frontendDist));

    // Catch-all route: serve index.html for client-side routing
    // (React Router handles the path on the frontend)
    app.get('*', (req, res) => {
        // Don't override API routes
        if (req.originalUrl.startsWith('/api')) {
            return res.status(404).json({ error: 'API endpoint not found' });
        }
        res.sendFile(path.join(frontendDist, 'index.html'));
    });
}
// ========================================================================

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

export default app;