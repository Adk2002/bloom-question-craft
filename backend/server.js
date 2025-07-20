import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import _pool from "./(database)/db.js"; //intentinaly unused
import authRoutes from "./auth/routes/authRoutes.js";

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

// (Optional) Add other routes here

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
