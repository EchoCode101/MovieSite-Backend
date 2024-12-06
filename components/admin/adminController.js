// Import necessary modules
import pool from "../../db/db.js";
import { encrypt, decrypt } from "../Utilities/encryptionUtils.js";
import {
  hashPassword,
  comparePassword,
} from "../Utilities/encryptionPassword.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  extractToken,
} from "../Utilities/tokenUtils.js";
import validationSchemas from "../Utilities/validationSchemas.js";
import passwordSchema from "../Utilities/passwordValidator.js";
import nodemailer from "nodemailer";
// import validateAndSanitizeUserInput from "../Utilities/validator.js";

const { adminSignupSchema, loginSchema } = validationSchemas;

export const adminSignup = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).send("All fields are required.");
  }
  const { error } = adminSignupSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const validationResult = passwordSchema.validate(password);
  if (!validationResult) {
    return res.status(400).send("Password is not strong enough");
  } else {
    try {
      const adminExists = await pool.query(
        "SELECT * FROM admins WHERE username = $1 OR email = $2",
        [username, email]
      );

      if (adminExists.rows.length > 0) {
        return res.status(400).json({ message: "Admin already exists." });
      }

      const hashedPassword = await hashPassword(password);
      const result = await pool.query(
        "INSERT INTO admins (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, role",
        [username, email, hashedPassword]
      );

      res.status(201).json({
        message: "Admin registered successfully!",
        admin: result.rows[0],
        Security: "Password is strong!",
      });
    } catch (err) {
      console.error("Error registering admin:", err.message);
      res.status(500).send("Internal server error.");
    }
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  // const sanitizedInput = validateAndSanitizeUserInput(req.body);
  const { error } = loginSchema.validate(req.body); // Joi validation schema for login
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [
      email,
    ]);

    const admin = result.rows[0];
    if (!admin) {
      return res.status(400).send("Invalid email or password.");
    }

    const match = await comparePassword(password, admin.password);
    if (!match) {
      return res.status(400).send("Invalid email or password.");
    }

    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);

    // Encrypt tokens before sending
    const encryptedAccessToken = await encrypt(accessToken);
    const encryptedRefreshToken = await encrypt(refreshToken);

    res.cookie("encryptedRefreshToken", encryptedRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login Successful",
      token: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,

      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err.message);
    res.status(500).send("Internal server error.");
  }
};

export const adminLogout = async (req, res) => {
  try {
    const token = extractToken(req); // Extract token using the utility

    const decryptedToken = await decrypt(token);
    verifyAccessToken(decryptedToken);
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + 30);

    await pool.query(
      "INSERT INTO token_blacklist (token, expires_at) VALUES ($1, $2)",
      [decryptedToken, expiryTime]
    );

    res.status(200).send("Admin logged out successfully.");
  } catch (err) {
    console.error("Admin logout error:", err.message);
    res.status(500).send("Internal server error.");
  }
};
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    // Check if email belongs to an admin or member
    let user;
    let userType;

    // Check in the admin table first
    const adminQuery = await pool.query(
      "SELECT * FROM admins WHERE email = $1",
      [email]
    );
    if (adminQuery.rows.length > 0) {
      user = adminQuery.rows[0];
      userType = "admin";
    }

    // Check in the member table if not found in the admin table
    if (!user) {
      const memberQuery = await pool.query(
        "SELECT * FROM members WHERE email = $1",
        [email]
      );
      if (memberQuery.rows.length > 0) {
        user = memberQuery.rows[0];
        userType = "member";
      }
    }

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with that email" });
    }

    // Generate a reset token
    const resetToken = generateAccessToken(user);
    const resetTokenExpiration = new Date(Date.now() + 1800000); // 30min expiration time

    // Insert into password_resets table
    await pool.query(
      "INSERT INTO password_resets (reset_token, reset_token_expiration, user_id, username, email, user_type) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        resetToken,
        resetTokenExpiration,
        user.id,
        user.username,
        user.email,
        userType,
      ]
    );
    // Create the reset password link
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    // Send reset email to user
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your preferred email service
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD, // Use environment variables for security
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const mailOptions = {
      from: process.env.MY_EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      text: `You requested a password reset.It has a short expiry time so hurry up! Click the link below to reset your password:\n\n${resetLink}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Please check your inbox, a password reset link has been sent.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};
// Example: Get all users (admin view)
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).send("Error fetching users");
  }
};

// Example: Update subscription plans
export const updateSubscription = async (req, res) => {
  const { userId, newPlan } = req.body;

  // Update logic...
};
// Example: Update subscription plans
export const dashboard = async (req, res) => {
  // const { userId, newPlan } = req.body;
  res.send("Welcome to the admin dashboard!");

  // Update logic...
};
