import pool from "../../db/db.js";
import { hashPassword } from "../Utilities/encryptionPassword.js";
import { PasswordResets, Members } from "../../models/index.js";
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
    const resetEntry = await PasswordResets.findOne({
      where: {
        reset_token: token,
        reset_token_expiration: { $gt: now },
      },
    });

    if (!resetEntry) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset password link" });
    }
    // Hash the new password
    const hashedPassword = await hashPassword(password);
    if (resetEntry.user_type === "member") {
      await Members.update(
        { password: hashedPassword },
        { where: { id: resetEntry.user_id } }
      );
    }

    // Clear the reset token after it has been used
    await PasswordResets.destroy({ where: { reset_token: token } });
    res.status(200).json({ message: "Password has been successfully reset." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};
