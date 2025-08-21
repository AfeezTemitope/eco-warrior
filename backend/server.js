import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import posts from "./routes/posts.js";
import comments from "./routes/comments.js";
import claps from "./routes/claps.js";
import admin from "./routes/admin.js";
import seedSuperAdmin from "./scripts/seedSuperAdmin.js";

dotenv.config();
const app = express();

// Proper __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend
app.use(express.static(path.join(__dirname, "..", "eco-warrior", "dist")));

// API routes
app.use("/api/posts", posts);
app.use("/api/comments", comments);
app.use("/api/claps", claps);
app.use("/api/admin", admin);

// Fallback to React index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "..", "eco-warrior", "dist", "index.html"));
});

const PORT = process.env.PORT || 5000;

await seedSuperAdmin()

app.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`))

