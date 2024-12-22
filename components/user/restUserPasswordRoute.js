import { hashPassword } from "../Utilities/encryptionUtils.js";
import { PasswordResets, Members } from "../../models/index.js";
import logger from "../Utilities/logger.js";
import createError from "http-errors";

// Reset Password Route
export const restPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return next(
      createError(400, "Password must be at least 6 characters long")
    );
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
      return next(createError(400, "Invalid or expired reset password link"));
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
    logger.error("Error resetting password:", error);
    next(createError(500, "Something went wrong. Please try again."));
  }
};
