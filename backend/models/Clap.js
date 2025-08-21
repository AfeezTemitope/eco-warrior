import mongoose from 'mongoose'

const clapSchema = new mongoose.Schema({
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    user_id: { type: String, required: true }, // UUID from Supabase auth.users
    created_at: { type: Date, default: Date.now }
}, {
    indexes: [{ key: { post_id: 1, user_id: 1 }, unique: true }]
});

const Clap = mongoose.model('Clap', clapSchema);
export default Clap;