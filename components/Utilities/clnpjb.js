// clnpjb.js
import cron from "node-cron";
import { Op } from "sequelize";
import sequelize from "../../db/db.js";
import TokenBlacklist from "../../models/TokenBlacklist.js";
import PasswordResets from "../../models/PasswordResets.js";

// Scheduled job to clean up expired tokens and password resets
const clnupjb = cron.schedule("0 0 * * *", async () => {
  console.log("🕒 Starting cleanup job...");

  try {
    await sequelize.transaction(async (t) => {
      // Delete expired tokens using Sequelize ORM
      const deletedTokens = await TokenBlacklist.destroy({
        where: {
          expires_at: {
            [Op.lt]: new Date(), // Less than the current time
          },
        },
        transaction: t,
      });

      // Delete expired password resets using Sequelize ORM
      const deletedResets = await PasswordResets.destroy({
        where: {
          reset_token_expiration: {
            [Op.lt]: new Date(),
          },
        },
        transaction: t,
      });

      console.log(
        `🧹 Cleanup completed: ${deletedTokens} token(s) removed from token_blacklist`
      );
      console.log(
        `🧹 Cleanup completed: ${deletedResets} record(s) removed from password_resets`
      );
    });
  } catch (err) {
    console.error("❌ Cleanup job failed:", err);
  }
});

export default clnupjb;
