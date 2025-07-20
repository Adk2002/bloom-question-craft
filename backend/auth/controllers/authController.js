import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../../(database)/db.js";

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Get user from database
      const result = await db.query('SELECT * FROM "User" WHERE email = $1', [
        email,
      ]);

      if (result.rows.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = result.rows[0];

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Update last login
      await db.query(
        'UPDATE "User" SET "lastLoginAt" = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      res.status(200).json({
        success: true,
        message: "Password reset eamil set successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error processin forgot password request",
      });
    }
  },

  async logout(req, res) {
    try{
      res.status(200).json({
        success: true,
        message: 'Logged out sucessfully'
      })
    }catch (error){
      res.status(500).json({
        success: falses,
        message: 'Error logging out'
      })
    }
  },

  async signup(req, res) {
    try {
      const { email, password, name } = req.body;

      // Check if user exists
      const existingUser = await db.query(
        'SELECT * FROM "User" WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await db.query(
        'INSERT INTO "User" (email, password, name) VALUES ($1, $2, $3) RETURNING *',
        [email, hashedPassword, name]
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default authController;
