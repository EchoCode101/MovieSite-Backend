import pool from "../../db/db.js";
import jwt from "jsonwebtoken";

import { encrypt, decrypt } from "../Utilities/encryptionUtils.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../Utilities/tokenUtils.js";
import passwordSchema from "../Utilities/passwordValidator.js";
import {
  hashPassword,
  comparePassword,
} from "../Utilities/encryptionPassword.js";
import validationSchemas from "../Utilities/validationSchemas.js";
const { userSchema, loginSchema } = validationSchemas;
import validateAndSanitizeUserInput from "../Utilities/validator.js";

// Handle user signup
export const signup = async (req, res) => {
  // Signup Endpoint+

  const { error } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { username, password, email, subscription_plan } = req.body;

  if (!username || !password || !email) {
    return res.status(400).send("Username, password, and email are required.");
  }

  if (password.length < 6) {
    return res.status(400).send("Password must be at least 6 characters long.");
  }

  try {
    const userExists = await pool.query(
      "SELECT * FROM members WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const result = await pool.query(
      "INSERT INTO members (username, email, password, subscription_plan) VALUES ($1, $2, $3, $4) RETURNING id, username, email, subscription_plan",
      [username, email, hashedPassword, subscription_plan]
    );

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email,
        subscription_plan: result.rows[0].subscription_plan,
      },
    });
  } catch (err) {
    console.error("Error details:", err);
    res.status(500).send("Error registering user.");
  }
};

// Handle user login
export const login = async (req, res) => {
  const sanitizedInput = validateAndSanitizeUserInput(req.body);

  const { error } = loginSchema.validate(req.body); // Joi validation schema for login
  if (error) return res.status(400).send(error.details[0].message);

  const { email, password } = req.body;
  const validationResult = passwordSchema.validate(password);

  if (!validationResult) {
    console.log("Password is not strong enough");
  } else {
    console.log("Password is strong");
  }

  try {
    const result = await pool.query(
      "SELECT * FROM members WHERE email = $1", // Query by email instead of email
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.device_logged_in === true) {
      return res
        .status(400)
        .json({ message: "You are already logged in on another device" });
    }

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(400).send("Invalid email or password");

    await pool.query(
      "UPDATE members SET device_logged_in = true WHERE email = $1", // Update query with email
      [email]
    );

    // const accessToken = jwt.sign(
    //   {
    //     id: user.id,
    //     email: user.email,
    //     username: user.username,
    //     role: user.role,
    //   }, // Include email instead of username
    //   process.env.JWT_SECRET,
    //   { expiresIn: "30m" }
    // );
    // const refreshToken = jwt.sign(
    //   {
    //     id: user.id,
    //     email: user.email,
    //     username: user.username,
    //     role: user.role,
    //   }, // Include email instead of username
    //   process.env.REFRESH_SECRET,
    //   { expiresIn: "7d" } // Refresh token should have a longer expiration
    // );
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Encrypt tokens before sending
    const encryptedAccessToken = await encrypt(accessToken);
    const encryptedRefreshToken = await encrypt(refreshToken);
    // Send the refresh token in a secure cookie
    res.cookie("encryptedRefreshToken", encryptedRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure it's sent only over HTTPS in production
      sameSite: "Strict", // Prevents cross-site cookie transmission
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiry
    });
    res.json({
      token: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      data: sanitizedInput,
    });
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection error:", err.message);
      return res.status(500).send("Database connection error");
    }
    console.error("Login error:", err.message);
    res.status(500).send("Internal Server Error");
  }
};

// Handle user logout
export const logout = async (req, res) => {
  try {
    if (!req.user || !req.user.username) {
      return res.status(400).send("Please login first");
    }

    const { username } = req.user;

    // Update the database to set device_logged_in to false
    await pool.query(
      "UPDATE members SET device_logged_in = false WHERE username = $1",
      [username]
    );

    // Set the token expiration time to 30 seconds in the blacklist
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + 30); // 30 seconds expiry

    // Capture and blacklist the access token from the Authorization header
    const authToken = req.headers["authorization"]?.split(" ")[1];
    if (!authToken) {
      return res.status(400).send("No token provided");
    }

    const decryptedToken = await decrypt(authToken); // Decrypt the token for storage

    // Insert the token into the blacklist
    await pool.query(
      "INSERT INTO token_blacklist (token, expires_at) VALUES ($1, $2)",
      [decryptedToken, expiryTime]
    );

    res.status(200).send("Logged out successfully");
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).send("Error logging out");
  }
};
