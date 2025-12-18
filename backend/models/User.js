import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => uuidv4()
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, { _id: false }); // ← IMPORTANT: This tells Mongoose not to create its own _id

const User = mongoose.model('User', userSchema);
export default User;