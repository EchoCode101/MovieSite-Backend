import pool from "../../db/db.js";
import { hashPassword } from "../Utilities/encryptionPassword.js";
import { Admins, PasswordResets } from "../../models/index.js";
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
    // Find the reset entry by token and expiration time
    const resetEntry = await PasswordResets.findOne({
      where: {
        reset_token: token,
        reset_token_expiration: {
          [Sequelize.Op.gt]: now, // Check if the token is still valid
        },
      },
    });

    if (!resetEntry) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset password link" });
    }
    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update the password based on user type
    if (resetEntry.user_type === "admin") {
      await Admins.update(
        { password: hashedPassword },
        { where: { id: resetEntry.user_id } }
      );
    }

    // Delete the used reset token
    await PasswordResets.destroy({
      where: { reset_token: token },
    });

    res.status(200).json({ message: "Password has been successfully reset." });
  } catch (error) {
    console.error("Error resetting password:", error.message);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};
