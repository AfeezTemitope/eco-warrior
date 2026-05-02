import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    image_url: String,
    author_id: { type: String, required: true }, // UUID from Supabase auth.users
    created_at: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);
export default Post;