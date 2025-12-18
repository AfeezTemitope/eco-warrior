import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

dotenv.config();

async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check users
        const users = await User.find();
        console.log('👥 USERS:');
        users.forEach(u => {
            console.log(`  - ${u.username} (${u.email})`);
            console.log(`    ID: ${u._id}`);
            console.log(`    Role: ${u.role}`);
            console.log(`    Legacy ID: ${u.legacyId || 'none'}\n`);
        });

        // Check posts
        const posts = await Post.find().limit(5);
        console.log('📝 POSTS (first 5):');
        posts.forEach(p => {
            console.log(`  - ${p.title}`);
            console.log(`    Post ID: ${p._id}`);
            console.log(`    Author ID: ${p.author_id}\n`);
        });

        // Check comments
        const comments = await Comment.find().limit(5);
        console.log('💬 COMMENTS (first 5):');
        comments.forEach(c => {
            console.log(`  - "${c.text.substring(0, 50)}..."`);
            console.log(`    Comment ID: ${c._id}`);
            console.log(`    Author ID: ${c.author_id}\n`);
        });

        // Check for orphaned posts
        const allPosts = await Post.find();
        const userIds = new Set(users.map(u => u._id.toString()));

        console.log('🔍 ORPHANED POSTS (author not in users):');
        let orphanCount = 0;
        for (const post of allPosts) {
            if (!userIds.has(post.author_id)) {
                console.log(`  - "${post.title}" by unknown author: ${post.author_id}`);
                orphanCount++;
            }
        }
        console.log(`  Total orphaned: ${orphanCount}\n`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

checkDatabase();