import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import _pool from "./(database)/db.js"; //intentinaly unused
import authRoutes from "./auth/routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js"
import path from 'path';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);

// This line makes files in the "uploads" folder available to be accessed directly by a URL like "/uploads/filename".
// For example, if you upload a profile picture, you can view it at http://yourserver/uploads/profiles/yourpicture.jpg
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// (Optional) Add other routes here
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
