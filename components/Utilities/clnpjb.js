// clnpjb.js
import cron from "node-cron";
import pool from "../../db/db.js"; // Assuming you are using the same database connection

// Scheduled job to clean up expired tokens from the blacklist every day at midnight
const clnupjb = cron.schedule("0 * * * *", async () => {
  try {
    // Delete expired tokens from the blacklist
    const result = await pool.query(
      "DELETE FROM token_blacklist WHERE expires_at < NOW()"
    );
    const result1 = await pool.query(
      "DELETE FROM password_resets WHERE reset_token_expiration < NOW()"
    );
    console.log(
      `Cleanup completed from token_blacklist table: ${
        result.rowCount || 0
      } expired token(s) removed`
    );
    console.log(
      `Cleanup completed from password_resets table: ${
        result1.rowCount || 0
      } expired token(s) removed`
    );
  } catch (err) {
    console.error("Error during token blacklist cleanup:", err);
    console.error("Error during password reset cleanup:", err);
  }
});

// Export the cron job instance (not the function itself)
export default clnupjb;
