import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../db.js";
import { encrypt, decrypt } from "../Utilities/utils.js";

const router = express.Router();

// Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM members WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) return res.status(404).send("User not found");

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).send("Invalid credentials");

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", encrypt(refreshToken), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ token: encrypt(accessToken) });
  } catch (err) {
    console.error("Error in login:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

// Token Refresh Route
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) return res.status(401).send("Refresh token required");

  try {
    const decryptedToken = decrypt(refreshToken);

    jwt.verify(decryptedToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err) return res.status(403).send("Invalid Refresh Token");

      const newAccessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "30m" }
      );

      res.json({ token: encrypt(newAccessToken) });
    });
  } catch (err) {
    console.error("Error in token refresh:", err.message);
    res.status(403).send("Invalid Refresh Token Format");
  }
});

// Export router as default
export default router;
