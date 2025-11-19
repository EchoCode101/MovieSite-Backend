import { hashPassword } from "../Utilities/encryptionUtils.js";
import { Admins, PasswordResets } from "../../models/index.js";
import logger from "../Utilities/logger.js";
import createError from "http-errors";

// Reset Password Route
export const restAdminPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return next(
      createError(400, "Password must be at least 6 characters long")
    );
  }
  const now = new Date();
  try {
    // Find the reset entry by token and expiration time
    const resetEntry = await PasswordResets.findOne({
      reset_token: token,
      reset_token_expiration: { $gt: now }, // Check if the token is still valid
    });

    if (!resetEntry) {
      return next(createError(400, "Invalid or expired reset password link"));
    }
    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update the password based on user type
    if (resetEntry.user_type === "admin") {
      await Admins.findByIdAndUpdate(resetEntry.user_id, {
        password: hashedPassword,
      });
    }

    // Delete the used reset token
    await PasswordResets.deleteOne({ reset_token: token });

    res.status(200).json({ message: "Password has been successfully reset." });
  } catch (error) {
    logger.error("Error resetting password:", error.message);
    next(createError(500, "Something went wrong. Please try again."));
  }
};
