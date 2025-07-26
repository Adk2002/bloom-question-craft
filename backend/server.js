import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import _pool from "./(database)/db.js";
import authRoutes from "./auth/routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js"
import pyqRoutes from './routes/pyqRoutes.js'
import path from 'path';

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Add fallback
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly specify methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Explicitly specify allowed headers
}));

app.use(express.json());
//Adding error handling middleware
// Add this before routes
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Fix: Consolidate PYQ routes under one base path
app.use('/api/pyq', pyqRoutes); // All PYQ routes will be under /api/pyq

// Increase payload limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});