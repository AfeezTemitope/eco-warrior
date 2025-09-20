import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import posts from "./routes/posts.js";
import comments from "./routes/comments.js";
import claps from "./routes/claps.js";
import admin from "./routes/admin.js";
import seedSuperAdmin from "./scripts/seedSuperAdmin.js";

dotenv.config();
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(cors({ origin: "https://eco-warrior-plum.vercel.app" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/posts", posts);
app.use("/api/comments", comments);
app.use("/api/claps", claps);
app.use("/api/admin", admin);

// Seed Super Admin
await seedSuperAdmin();

// Export for Vercel (serverless)
export default app;
