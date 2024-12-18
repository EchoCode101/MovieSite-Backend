import pool from "../../db/db.js";
import { Members, PasswordResets, TokenBlacklist } from "../../models/index.js";
import { encrypt, decrypt } from "../Utilities/encryptionUtils.js";
import {
  generateAccessToken,
  generateRefreshToken,
  extractToken,
} from "../Utilities/tokenUtils.js";

import passwordSchema from "../Utilities/passwordValidator.js";
import {
  hashPassword,
  comparePassword,
} from "../Utilities/encryptionPassword.js";
import { Sequelize } from "sequelize";
import validationSchemas from "../Utilities/validationSchemas.js";
const { userSignupSchema, loginSchema } = validationSchemas;
// import validateAndSanitizeUserInput from "../Utilities/validator.js";

// Handle user signup
export const signup = async (req, res) => {
  // Signup Endpoint+

  const { error } = userSignupSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { username, password, email, subscription_plan = "free" } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (password.length < 6) {
    return res.status(400).send("Password must be at least 6 characters long.");
  }
  const validationResult = passwordSchema.validate(password);

  if (!validationResult) {
    console.log("Password is not strong enough");
  } else {
    console.log("Password is strong");
  }

  try {
    // Check if user exists
    const userExists = await Members.findOne({
      where: {
        [Sequelize.Op.or]: [{ username }, { email }],
      },
    });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "Username or email already exists." });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await Members.create({
      username,
      email,
      password: hashedPassword,
      subscription_plan,
    });

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        subscription_plan: newUser.subscription_plan,
      },
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Error registering user." });
  }
};

// Handle user login
export const login = async (req, res) => {
  // const sanitizedInput = validateAndSanitizeUserInput(req.body);

  const { error } = loginSchema.validate(req.body); // Joi validation schema for login
  if (error) return res.status(400).send(error.details[0].message);

  const { email, password } = req.body;

  try {
    const user = await Members.findOne({ where: { email } });
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

    await user.update({ device_logged_in: true });

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
      secure: process.env.NODE_ENV === "production" || true, // Ensure it's sent only over HTTPS in production
      sameSite: "Strict", // Prevents cross-site cookie transmission
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiry
    });
    res.json({
      token: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
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

    // Update device_logged_in to false
    await Members.update({ device_logged_in: false }, { where: { username } });

    // Set the token expiration time to 30 seconds in the blacklist
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + 30); // 30 seconds expiry
    const token = extractToken(req); // Extract token using the utility

    const decryptedToken = await decrypt(token); // Decrypt the token for storage

    // Insert token into blacklist
    await TokenBlacklist.create({
      token: decryptedToken,
      expires_at: expiryTime,
    });

    res.status(200).send("Logged out successfully");
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).send("Error logging out");
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await Members.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with that email" });
    }

    const resetToken = generateAccessToken(user);
    const resetTokenExpiration = new Date(Date.now() + 1800000); // 30min expiration

    await PasswordResets.create({
      reset_token: resetToken,
      reset_token_expiration: resetTokenExpiration,
      user_id: user.id,
      username: user.username,
      email: user.email,
      user_type: "member",
    });

    const resetLink = `${process.env.ORIGIN_LINK}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: process.env.MY_EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      text: `You requested a password reset. It has a short expiry time so hurry up! Click the link below to reset your password:\n\n${resetLink}`,
    });

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
