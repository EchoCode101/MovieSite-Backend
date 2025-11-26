import { TokenBlacklistModel } from "../models/tokenBlacklist.model.js";

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const entry = await TokenBlacklistModel.findOne({ token }).exec();
  return !!entry;
}

export async function blacklistToken(
  token: string,
  expiryInSeconds = 30,
): Promise<void> {
  const expiryTime = new Date();
  expiryTime.setSeconds(expiryTime.getSeconds() + expiryInSeconds);

  await TokenBlacklistModel.updateOne(
    { token },
    { $set: { expires_at: expiryTime } },
    { upsert: true },
  ).exec();
}


