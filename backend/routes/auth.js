const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();
const router = express.Router();

//user register API
router.post(
    "/register",
    [
      body("email").isEmail().withMessage("Invalid email"),
      body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ],
    async (req, res) => {
        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
    
        const { email, password } = req.body;

        try {
            // Check if the user already exists
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
              return res.status(400).json({ message: "User already exists" });
            }
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            // Create a new user
            const newUser = await prisma.user.create({
                data: { email, password: hashedPassword },
              });
        
              res.status(201).json({ message: "User registered successfully" });
            } catch (error) {
              res.status(500).json({ message: "Internal server error" });
            }
          }
        );

//user login API
router.post(
    "/login",
    [
      body("email").isEmail().withMessage("Invalid email"),
      body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
    
        const { email, password } = req.body;

        try {
            // Check if the user exists
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
              return res.status(400).json({ message: "Invalid email or password" });
            }

            // Check if the password is valid
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
              return res.status(400).json({ message: "Invalid email or password" });
            }

            // Generate JWT token
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

            res.json({ token });
          } catch (error) {
            res.status(500).json({ message: "Internal server error" });
          }
        }
      );

// Protect API middleware
const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access denied" });
  
    try {
      const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };

// Get user profile API
router.get("/me", authMiddleware, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ message: "User not found" });
  
    res.json({ id: user.id, email: user.email });
  });
  
  module.exports = router;