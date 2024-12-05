import jwt from "jsonwebtoken";
import pool from "../../db/db.js"; // Ensure you have a proper db connection
import { encrypt, decrypt } from "../Utilities/encryptionUtils.js";
import {
  verifyRefreshToken,
  generateAccessToken,
} from "../Utilities/tokenUtils.js";
// Refresh token route to generate a new access token
export const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(401).send("Refresh token required");

  try {
    const decryptedToken = await decrypt(token);

    // Check if the refresh token exists in the blacklist

    const result = await pool.query(
      "SELECT * FROM token_blacklist WHERE token = $1",
      [decryptedToken]
    );
    if (result.rows.length > 0) {
      return res.status(403).send("Refresh token has been revoked");
    }
    // Verify the refresh token
    const user = verifyRefreshToken(decryptedToken);

    // jwt.verify(decryptedToken, process.env.JWT_SECRET, async (err, user) => {
    //   if (err) return res.status(403).send("Invalid Refresh Token");

    // Generate new access token
    const accessToken = generateAccessToken(user);

    // // Generate a new access token
    // const accessToken = jwt.sign(
    //   {
    //     id: user.id,
    //     username: user.username,
    //     email: user.email,
    //     role: user.role,
    //   },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "30m" }
    // );

    // Encrypt the new access token before sending it
    const encryptedAccessToken = await encrypt(accessToken);
    res.json({ token: encryptedAccessToken });
  } catch (error) {
    console.error("Error in refresh token logic:", error.message);
    res.status(403).send("Invalid Refresh Token Format");
  }
};
