import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import postsRouter from './routes/posts.js';
import clapsRouter from './routes/claps.js';
import commentsRouter from './routes/comments.js';
import adminRouter from './routes/admin.js';
import seedSuperAdmin from './scripts/seedSuperAdmin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Auto-detect environment (works on Windows, Mac, Linux)
const isProduction = process.env.NODE_ENV === 'production' ||
    process.env.RENDER ||
    process.env.VERCEL;

console.log(`🌍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: isProduction ? 'production' : 'development'
    });
});

// API Routes
app.use('/api/posts', postsRouter);
app.use('/api/claps', clapsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/admin', adminRouter);

// Serve frontend in production
if (isProduction) {
    const frontendDistPath = path.join(__dirname, '../frontend/dist');
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
    console.log('✅ Serving frontend from:', frontendDistPath);
} else {
    console.log('🔧 Development mode - Frontend served separately on port 5173');
}

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB connected');
        await seedSuperAdmin();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            if (isProduction) {
                console.log(`🌐 Access app at: http://localhost:${PORT}`);
            } else {
                console.log(`🌐 Backend API: http://localhost:${PORT}/api`);
                console.log(`🌐 Frontend: http://localhost:5173`);
            }
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });