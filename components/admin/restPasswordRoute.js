import pool from "../../db/db.js";
import { hashPassword } from "../Utilities/encryptionPassword.js";
// Reset Password Route
export const restPasswordRoute = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }
  const now = new Date();
  try {
    // Find the password reset entry by token
    const resetQuery = await pool.query(
      "SELECT * FROM password_resets WHERE reset_token = $1 AND reset_token_expiration > $2",
      [token, now]
    );

    const resetEntry = resetQuery.rows[0];

    if (!resetEntry) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update the user's password based on their user type and ID
    if (resetEntry.user_type === "admin") {
      await pool.query("UPDATE admins SET password = $1 WHERE id = $2", [
        hashedPassword,
        resetEntry.user_id,
      ]);
    } else if (resetEntry.user_type === "member") {
      await pool.query("UPDATE members SET password = $1 WHERE id = $2", [
        hashedPassword,
        resetEntry.user_id,
      ]);
    }

    // Clear the reset token after it has been used
    await pool.query("DELETE FROM password_resets WHERE reset_token = $1", [
      token,
    ]);

    res.status(200).json({ message: "Password has been successfully reset." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};
