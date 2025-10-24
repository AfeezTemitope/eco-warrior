import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import posts from "./routes/posts.js";
import comments from "./routes/comments.js";
import claps from "./routes/claps.js";
import admin from "./routes/admin.js";
import seedSuperAdmin from "./scripts/seedSuperAdmin.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/posts", posts);
app.use("/api/comments", comments);
app.use("/api/claps", claps);
app.use("/api/admin", admin);

// Serve React Frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "..", "eco-warrior", "dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "eco-warrior", "dist", "index.html"));
});

// Start Server
async function startServer() {
    await seedSuperAdmin();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

startServer();