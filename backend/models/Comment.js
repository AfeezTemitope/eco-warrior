import mongoose from "mongoose"
import router from "../routes/admin.js";

const commentSchema = new mongoose.Schema({
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author_id: { type: String, required: true }, // UUID from Supabase auth.users
    text: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;